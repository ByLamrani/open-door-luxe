-- 1. Referral fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by uuid,
  ADD COLUMN IF NOT EXISTS referred_product_id text,
  ADD COLUMN IF NOT EXISTS referred_units_counter integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_product_rewarded boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET referral_code = upper(substr(replace(id::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_key ON public.profiles (referral_code);

CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_referral_code ON public.profiles;
CREATE TRIGGER profiles_set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- 2. Reward ledger
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  order_id text,
  reward_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.referral_rewards TO authenticated;
GRANT ALL ON public.referral_rewards TO service_role;

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own referral rewards"
ON public.referral_rewards FOR SELECT TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- 3. Reward processing on purchase
CREATE OR REPLACE FUNCTION public.process_referral_rewards(
  _order_id text,
  _product_ids text[],
  _unit_count integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _buyer uuid := auth.uid();
  _prof public.profiles%ROWTYPE;
  _referrer uuid;
  _wallet_id uuid;
  _payout numeric := 0;
  _before integer;
  _after integer;
  _milestones integer;
BEGIN
  IF _buyer IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not authenticated');
  END IF;

  SELECT * INTO _prof FROM public.profiles WHERE user_id = _buyer;
  IF NOT FOUND OR _prof.referred_by IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'rewarded', 0);
  END IF;

  _referrer := _prof.referred_by;
  _before := COALESCE(_prof.referred_units_counter, 0);
  _after := _before + GREATEST(COALESCE(_unit_count, 0), 0);

  -- Product-specific invite: $1 once, when the invited product is purchased
  IF _prof.referred_product_id IS NOT NULL
     AND NOT _prof.referral_product_rewarded
     AND _prof.referred_product_id = ANY(_product_ids) THEN
    _payout := _payout + 1;
    INSERT INTO public.referral_rewards (referrer_id, referred_user_id, order_id, reward_type, amount)
    VALUES (_referrer, _buyer, _order_id, 'product_invite', 1);
    UPDATE public.profiles SET referral_product_rewarded = true WHERE user_id = _buyer;
  END IF;

  -- Platform invite: $1 for every 20 products purchased
  _milestones := (_after / 20) - (_before / 20);
  IF _milestones > 0 THEN
    _payout := _payout + _milestones;
    INSERT INTO public.referral_rewards (referrer_id, referred_user_id, order_id, reward_type, amount)
    VALUES (_referrer, _buyer, _order_id, 'platform_invite', _milestones);
  END IF;

  UPDATE public.profiles SET referred_units_counter = _after WHERE user_id = _buyer;

  IF _payout > 0 THEN
    SELECT id INTO _wallet_id FROM public.wallets WHERE user_id = _referrer;
    IF _wallet_id IS NULL THEN
      INSERT INTO public.wallets (user_id, balance, available_balance)
      VALUES (_referrer, _payout, _payout)
      RETURNING id INTO _wallet_id;
    ELSE
      UPDATE public.wallets
      SET balance = balance + _payout,
          available_balance = available_balance + _payout,
          updated_at = now()
      WHERE id = _wallet_id;
    END IF;

    INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
    VALUES (_wallet_id, _payout, 'referral_reward', 'Invite reward for order ' || COALESCE(_order_id, ''));
  END IF;

  RETURN jsonb_build_object('ok', true, 'rewarded', _payout);
END;
$$;