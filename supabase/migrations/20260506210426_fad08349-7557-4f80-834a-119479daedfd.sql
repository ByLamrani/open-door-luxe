ALTER TABLE public.seller_listings
  ADD COLUMN IF NOT EXISTS parent_listing_id uuid,
  ADD COLUMN IF NOT EXISTS bundle_price numeric,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'seller_listings_parent_listing_id_fkey'
  ) THEN
    ALTER TABLE public.seller_listings
      ADD CONSTRAINT seller_listings_parent_listing_id_fkey
      FOREIGN KEY (parent_listing_id)
      REFERENCES public.seller_listings(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_seller_listings_parent_listing_id
  ON public.seller_listings(parent_listing_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'seller_listings'
      AND policyname = 'Sellers can view their own listings'
  ) THEN
    CREATE POLICY "Sellers can view their own listings"
      ON public.seller_listings
      FOR SELECT
      USING (auth.uid() = seller_id);
  END IF;
END $$;