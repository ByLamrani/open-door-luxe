
-- 1. Update handle_new_user to extract all metadata fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _account_type text;
  _meta jsonb;
BEGIN
  _meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  _account_type := COALESCE(_meta->>'account_type', 'buyer');

  INSERT INTO public.profiles (
    user_id, full_name, email, account_type,
    phone, home_address, city, country, avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(_meta->>'full_name', _meta->>'name', ''),
    NEW.email,
    _account_type,
    NULLIF(_meta->>'phone', ''),
    NULLIF(_meta->>'home_address', ''),
    NULLIF(_meta->>'city', ''),
    COALESCE(NULLIF(_meta->>'country', ''), 'Morocco'),
    COALESCE(_meta->>'avatar_url', _meta->>'picture')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(NULLIF(EXCLUDED.full_name,''), public.profiles.full_name),
    account_type = EXCLUDED.account_type,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    home_address = COALESCE(EXCLUDED.home_address, public.profiles.home_address),
    city = COALESCE(EXCLUDED.city, public.profiles.city),
    country = COALESCE(EXCLUDED.country, public.profiles.country),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0.00)
    ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;

  IF _account_type = 'seller' THEN
    INSERT INTO public.seller_profiles (user_id, business_name)
    VALUES (NEW.id, NULLIF(_meta->>'business_name',''))
    ON CONFLICT (user_id) DO UPDATE SET business_name = COALESCE(EXCLUDED.business_name, public.seller_profiles.business_name);
  END IF;

  IF _account_type = 'shipping_company' THEN
    INSERT INTO public.shipping_company_profiles (user_id, company_name, country_of_origin)
    VALUES (
      NEW.id,
      NULLIF(_meta->>'company_name',''),
      COALESCE(NULLIF(_meta->>'country_of_origin',''), 'Morocco')
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- unique constraints to support ON CONFLICT
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS seller_profiles_user_id_key;
ALTER TABLE public.seller_profiles ADD CONSTRAINT seller_profiles_user_id_key UNIQUE (user_id);
ALTER TABLE public.shipping_company_profiles DROP CONSTRAINT IF EXISTS shipping_company_profiles_user_id_key;
ALTER TABLE public.shipping_company_profiles ADD CONSTRAINT shipping_company_profiles_user_id_key UNIQUE (user_id);

-- 2. Seller listings: name + expiry
ALTER TABLE public.seller_listings
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '4 months');

CREATE INDEX IF NOT EXISTS idx_seller_listings_expires_at ON public.seller_listings(expires_at);

CREATE OR REPLACE FUNCTION public.expire_old_listings()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.seller_listings
    SET status = 'expired', updated_at = now()
    WHERE status = 'active' AND expires_at < now();
$$;

-- 3. Verification: admin_notes column for processing
ALTER TABLE public.verification_documents
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- 4. Allow admins to view all verification docs (already present), nothing more

-- 5. Admin role helper: ensure first user can be admin via insert policy is intentionally absent; admins seeded manually.
