CREATE TABLE public.companion_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  frequency text NOT NULL DEFAULT 'weekly',
  whatsapp_phone text,
  notify_orders boolean NOT NULL DEFAULT true,
  notify_listings boolean NOT NULL DEFAULT true,
  notify_occasions boolean NOT NULL DEFAULT true,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companion_settings TO authenticated;
GRANT ALL ON public.companion_settings TO service_role;
ALTER TABLE public.companion_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own companion settings"
  ON public.companion_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_companion_settings_updated_at
  BEFORE UPDATE ON public.companion_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.special_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  occasion text,
  description text,
  discount_pct numeric NOT NULL DEFAULT 0,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.special_offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.special_offers TO authenticated;
GRANT ALL ON public.special_offers TO service_role;
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active offers"
  ON public.special_offers FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage offers"
  ON public.special_offers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_special_offers_updated_at
  BEFORE UPDATE ON public.special_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();