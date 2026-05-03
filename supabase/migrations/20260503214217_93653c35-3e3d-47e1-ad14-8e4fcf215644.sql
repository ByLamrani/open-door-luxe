
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier text NOT NULL,
  amount numeric NOT NULL,
  paypal_order_id text,
  paypal_capture_id text,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription payments" ON public.subscription_payments
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users create own subscription payments" ON public.subscription_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscription payments" ON public.subscription_payments
  FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_subscription_payments_updated_at
  BEFORE UPDATE ON public.subscription_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to switch buyer to seller (creates seller_profile if missing)
CREATE OR REPLACE FUNCTION public.upgrade_to_seller(_business_name text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE profiles SET account_type = 'seller', updated_at = now() WHERE user_id = _uid;

  INSERT INTO seller_profiles (user_id, business_name)
  VALUES (_uid, _business_name)
  ON CONFLICT (user_id) DO UPDATE SET business_name = COALESCE(EXCLUDED.business_name, seller_profiles.business_name);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Ensure seller_profiles.user_id is unique for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seller_profiles_user_id_key'
  ) THEN
    ALTER TABLE public.seller_profiles ADD CONSTRAINT seller_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Function to activate subscription after payment captured
CREATE OR REPLACE FUNCTION public.activate_subscription(_tier text, _months int DEFAULT 1)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  _uid uuid := auth.uid();
  _expires timestamptz;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  _expires := now() + (_months || ' months')::interval;
  UPDATE profiles 
    SET subscription_tier = _tier, subscription_expires_at = _expires, updated_at = now()
    WHERE user_id = _uid;
  RETURN jsonb_build_object('success', true, 'expires_at', _expires);
END;
$$;
