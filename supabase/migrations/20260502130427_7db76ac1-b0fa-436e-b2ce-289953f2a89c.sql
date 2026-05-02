
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS due_on_delivery numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paypal_order_id text,
  ADD COLUMN IF NOT EXISTS paypal_capture_id text,
  ADD COLUMN IF NOT EXISTS vendor_id uuid,
  ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vendor_share numeric DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.wallet_topups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  paypal_order_id text,
  paypal_capture_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_topups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own topups" ON public.wallet_topups
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users create own topups" ON public.wallet_topups
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System updates topups" ON public.wallet_topups
  FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_wallet_topups_updated_at
  BEFORE UPDATE ON public.wallet_topups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow orders update for the buyer (so post-capture status flows can write back)
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Atomic wallet-to-wallet payment function (buyer -> vendor pending)
CREATE OR REPLACE FUNCTION public.wallet_pay_vendor(
  _buyer uuid,
  _vendor uuid,
  _amount numeric,
  _order_id text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _buyer_balance numeric;
BEGIN
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT balance INTO _buyer_balance FROM wallets WHERE user_id = _buyer FOR UPDATE;
  IF _buyer_balance IS NULL OR _buyer_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  UPDATE wallets SET balance = balance - _amount, updated_at = now()
    WHERE user_id = _buyer;

  -- Vendor 90%, platform 10%
  UPDATE wallets SET 
    pending_balance = pending_balance + (_amount * 0.9),
    updated_at = now()
  WHERE user_id = _vendor;

  INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description)
  SELECT id, -_amount, 'wallet_payment', 'Order ' || _order_id FROM wallets WHERE user_id = _buyer;

  INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description)
  SELECT id, _amount * 0.9, 'sale_pending', 'Order ' || _order_id FROM wallets WHERE user_id = _vendor;

  RETURN jsonb_build_object('success', true, 'vendor_share', _amount * 0.9, 'platform_fee', _amount * 0.1);
END;
$$;

-- Crediting wallet from a verified PayPal top-up
CREATE OR REPLACE FUNCTION public.credit_wallet_from_topup(
  _user uuid,
  _amount numeric,
  _topup_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE wallets SET balance = balance + _amount, updated_at = now()
    WHERE user_id = _user;
  INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description)
  SELECT id, _amount, 'topup', 'PayPal top-up ' || _topup_id::text FROM wallets WHERE user_id = _user;
END;
$$;
