
-- Add account_type to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'buyer';

-- Create seller_profiles table
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  business_name text,
  national_id_url text,
  passport_url text,
  verification_status text NOT NULL DEFAULT 'pending',
  preferred_currency text NOT NULL DEFAULT 'USD',
  fee_tier text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own seller profile" ON public.seller_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sellers can update their own seller profile" ON public.seller_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Sellers can insert their own seller profile" ON public.seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create shipping_company_profiles table
CREATE TABLE IF NOT EXISTS public.shipping_company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  company_name text,
  country_of_origin text NOT NULL,
  registration_number text,
  legal_address text,
  siege_social text,
  legal_document_url text,
  verification_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view their own profile" ON public.shipping_company_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Companies can update their own profile" ON public.shipping_company_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Companies can insert their own profile" ON public.shipping_company_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create seller_listings table
CREATE TABLE IF NOT EXISTS public.seller_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  product_id uuid,
  listing_type text NOT NULL DEFAULT 'normal',
  listing_fee numeric NOT NULL DEFAULT 0.10,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings" ON public.seller_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage their own listings" ON public.seller_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own listings" ON public.seller_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete their own listings" ON public.seller_listings FOR DELETE USING (auth.uid() = seller_id);

-- Create seller_transactions table
CREATE TABLE IF NOT EXISTS public.seller_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  order_id text,
  gross_amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL DEFAULT 0,
  transaction_fee numeric NOT NULL DEFAULT 0,
  processing_fee numeric NOT NULL DEFAULT 0,
  ai_fee numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  cleared_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own transactions" ON public.seller_transactions FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "System can insert seller transactions" ON public.seller_transactions FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Update handle_new_user to store account_type and create role-specific profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _account_type text;
BEGIN
  _account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer');
  
  INSERT INTO public.profiles (user_id, full_name, email, account_type)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email, _account_type);
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0.00);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Create seller profile if seller
  IF _account_type = 'seller' THEN
    INSERT INTO public.seller_profiles (user_id)
    VALUES (NEW.id);
  END IF;

  -- Create shipping company profile if shipping_company
  IF _account_type = 'shipping_company' THEN
    INSERT INTO public.shipping_company_profiles (user_id, country_of_origin)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'country_of_origin', 'Morocco'));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON public.seller_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipping_company_profiles_updated_at BEFORE UPDATE ON public.shipping_company_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seller_listings_updated_at BEFORE UPDATE ON public.seller_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
