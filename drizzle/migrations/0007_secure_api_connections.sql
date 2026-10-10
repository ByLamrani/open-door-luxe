ALTER TABLE public.api_connections ADD COLUMN IF NOT EXISTS secret_ciphertext text;
ALTER TABLE public.api_connections ADD COLUMN IF NOT EXISTS secret_hints jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.api_connections ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
REVOKE ALL ON public.api_connections FROM anon, authenticated;
GRANT ALL ON public.api_connections TO service_role;