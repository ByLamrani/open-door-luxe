
-- Integration keys (Stripe, PayPal, Google Analytics, custom)
CREATE TABLE public.integration_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  label text,
  api_key text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner select integration_keys" ON public.integration_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner insert integration_keys" ON public.integration_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update integration_keys" ON public.integration_keys
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner delete integration_keys" ON public.integration_keys
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_integration_keys_updated
  BEFORE UPDATE ON public.integration_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Shipping jobs
CREATE TABLE public.shipping_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id uuid NOT NULL,
  order_id text,
  buyer_name text,
  destination text,
  status text NOT NULL DEFAULT 'received', -- received | sending | delivered | returned
  return_reason text,
  notes text,
  received_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shipping_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shipper select shipping_jobs" ON public.shipping_jobs
  FOR SELECT USING (auth.uid() = shipper_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "shipper insert shipping_jobs" ON public.shipping_jobs
  FOR INSERT WITH CHECK (auth.uid() = shipper_id);
CREATE POLICY "shipper update shipping_jobs" ON public.shipping_jobs
  FOR UPDATE USING (auth.uid() = shipper_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "shipper delete shipping_jobs" ON public.shipping_jobs
  FOR DELETE USING (auth.uid() = shipper_id);

CREATE TRIGGER trg_shipping_jobs_updated
  BEFORE UPDATE ON public.shipping_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
