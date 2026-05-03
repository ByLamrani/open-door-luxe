ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Backfill from seller/shipping profiles
UPDATE public.profiles p SET is_verified = true, verified_at = now()
  FROM public.seller_profiles s WHERE s.user_id = p.user_id AND s.is_verified = true;
UPDATE public.profiles p SET is_verified = true, verified_at = now()
  FROM public.shipping_company_profiles s WHERE s.user_id = p.user_id AND s.is_verified = true;