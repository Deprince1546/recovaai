
DROP POLICY IF EXISTS "Anyone can record a deployment" ON public.deployments;
DROP POLICY IF EXISTS "Deployment records are publicly viewable" ON public.deployments;
DROP POLICY IF EXISTS "Anyone can record a scan" ON public.scans;
DROP POLICY IF EXISTS "Scan history is publicly viewable" ON public.scans;

REVOKE ALL ON public.deployments FROM anon, authenticated;
REVOKE ALL ON public.scans FROM anon, authenticated;
GRANT ALL ON public.deployments TO service_role;
GRANT ALL ON public.scans TO service_role;

ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_key text NOT NULL,
  endpoint text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  UNIQUE (bucket_key, endpoint)
);

REVOKE ALL ON public.api_rate_limits FROM anon, authenticated;
GRANT ALL ON public.api_rate_limits TO service_role;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
