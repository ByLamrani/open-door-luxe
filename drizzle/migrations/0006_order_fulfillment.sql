CREATE TABLE public.order_fulfillment (
  order_id text PRIMARY KEY,
  stage text NOT NULL DEFAULT 'new',
  steps jsonb NOT NULL DEFAULT '{}'::jsonb,
  receiver jsonb NOT NULL DEFAULT '{}'::jsonb,
  package jsonb NOT NULL DEFAULT '{}'::jsonb,
  delivery_company_id uuid,
  tracking_number text,
  delivery_cost numeric NOT NULL DEFAULT 0,
  expenses jsonb NOT NULL DEFAULT '[]'::jsonb,
  cod_collected numeric NOT NULL DEFAULT 0,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_fulfillment TO authenticated;
GRANT ALL ON public.order_fulfillment TO service_role;
ALTER TABLE public.order_fulfillment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage fulfillment" ON public.order_fulfillment FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_order_fulfillment_updated BEFORE UPDATE ON public.order_fulfillment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();