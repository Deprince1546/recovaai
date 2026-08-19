CREATE TABLE public.deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  network TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  supply NUMERIC NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 18,
  logo TEXT,
  description TEXT,
  owner_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  source_code TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  abi JSONB NOT NULL,
  bytecode TEXT NOT NULL,
  deployed_bytecode TEXT,
  compiler_version TEXT NOT NULL,
  openzeppelin_version TEXT NOT NULL,
  optimizer BOOLEAN NOT NULL DEFAULT true,
  optimizer_runs INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX deployments_contract_idx ON public.deployments (lower(contract_address), chain_id);
CREATE INDEX deployments_wallet_idx ON public.deployments (lower(wallet_address));

GRANT SELECT, INSERT ON public.deployments TO anon, authenticated;
GRANT ALL ON public.deployments TO service_role;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deployment records are publicly viewable" ON public.deployments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can record a deployment" ON public.deployments FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_address TEXT NOT NULL,
  network TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  wallet_address TEXT,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX scans_contract_idx ON public.scans (lower(contract_address), chain_id);

GRANT SELECT, INSERT ON public.scans TO anon, authenticated;
GRANT ALL ON public.scans TO service_role;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scan history is publicly viewable" ON public.scans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can record a scan" ON public.scans FOR INSERT TO anon, authenticated WITH CHECK (true);