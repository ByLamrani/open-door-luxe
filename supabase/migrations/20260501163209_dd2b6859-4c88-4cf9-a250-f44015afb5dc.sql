
-- Add admin to app_role enum if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'admin';
  END IF;
END $$;

-- Wallet columns
ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS available_balance numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_balance numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lifetime_earnings numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

-- Verification flag
ALTER TABLE public.seller_profiles
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.shipping_company_profiles
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- Verification documents
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_type text NOT NULL,
  document_type text NOT NULL,
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reject_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own docs"
  ON public.verification_documents FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can upload their own docs"
  ON public.verification_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update docs"
  ON public.verification_documents FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_verification_documents_updated_at
  BEFORE UPDATE ON public.verification_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Escrow transactions
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  buyer_id uuid,
  seller_id uuid,
  shipper_id uuid,
  total_amount numeric NOT NULL DEFAULT 0,
  deposit_amount numeric NOT NULL DEFAULT 0,
  vendor_share numeric NOT NULL DEFAULT 0,
  shipper_share numeric NOT NULL DEFAULT 0,
  platform_share numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'held',
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers/sellers/shippers can view their escrow"
  ON public.escrow_transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() = shipper_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert escrow"
  ON public.escrow_transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can update escrow"
  ON public.escrow_transactions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_escrow_transactions_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Withdrawal requests
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  method text NOT NULL,
  destination jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own withdrawals"
  ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own withdrawals"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update withdrawals"
  ON public.withdrawal_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin can view all seller/shipping profiles for verification queue
CREATE POLICY "Admins view all seller profiles"
  ON public.seller_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update seller profiles"
  ON public.seller_profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all shipping profiles"
  ON public.shipping_company_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update shipping profiles"
  ON public.shipping_company_profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket (private) for verification docs
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own verification docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own verification docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'verification-docs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Admins update verification storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'verification-docs' AND public.has_role(auth.uid(), 'admin'));
