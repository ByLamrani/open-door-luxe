CREATE TABLE public.account_permissions (
  user_id uuid PRIMARY KEY,
  kind text NOT NULL DEFAULT 'agent',
  job_title text,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_permissions TO authenticated;
GRANT ALL ON public.account_permissions TO service_role;
ALTER TABLE public.account_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage permissions" ON public.account_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users read own permissions" ON public.account_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE TRIGGER trg_account_permissions_updated BEFORE UPDATE ON public.account_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();