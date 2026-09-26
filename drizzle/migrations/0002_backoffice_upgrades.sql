ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status = ANY (ARRAY['pending','processing','shipped','delivered','returned','received','cancelled']));

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_price numeric;

ALTER TABLE public.special_offers ADD COLUMN IF NOT EXISTS target_categories text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.special_offers ADD COLUMN IF NOT EXISTS target_subcategories text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.special_offers ADD COLUMN IF NOT EXISTS target_products text[] NOT NULL DEFAULT '{}';

CREATE TABLE public.delivery_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_phone text,
  contact_email text,
  price_per_delivery numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_companies TO authenticated;
GRANT ALL ON public.delivery_companies TO service_role;
ALTER TABLE public.delivery_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage delivery companies" ON public.delivery_companies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_company_id uuid REFERENCES public.delivery_companies(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_cost numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cod_settled boolean NOT NULL DEFAULT false;

CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone reads product images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');