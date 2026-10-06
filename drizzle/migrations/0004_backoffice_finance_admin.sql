CREATE TABLE public.product_inventory (
  product_id text PRIMARY KEY,
  quantity integer NOT NULL DEFAULT 0,
  buying_price numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_inventory TO authenticated;
GRANT ALL ON public.product_inventory TO service_role;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage inventory" ON public.product_inventory FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'other',
  label text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  spent_on date NOT NULL DEFAULT current_date,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage expenses" ON public.expenses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.company_settings (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage company" ON public.company_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.api_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  category text NOT NULL DEFAULT 'custom',
  label text,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_connections TO authenticated;
GRANT ALL ON public.api_connections TO service_role;
ALTER TABLE public.api_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage connections" ON public.api_connections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- The owner's admin role can never be removed
CREATE OR REPLACE FUNCTION public.protect_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.role = 'admin' AND EXISTS (
    SELECT 1 FROM auth.users WHERE id = OLD.user_id AND lower(email) = 'adil.lamrani.ejjouti@gmail.com'
  ) THEN
    IF TG_OP = 'DELETE' OR NEW.role <> 'admin' OR NEW.user_id <> OLD.user_id THEN
      RAISE EXCEPTION 'The owner admin account cannot be removed';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_protect_owner_admin BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.protect_owner_admin();