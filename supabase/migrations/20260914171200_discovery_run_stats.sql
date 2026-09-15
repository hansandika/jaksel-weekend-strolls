-- Unique (source, source_id) as a real constraint so Edge Function upserts work.
DROP INDEX IF EXISTS public.candidates_source_uidx;
ALTER TABLE public.candidates
  DROP CONSTRAINT IF EXISTS candidates_source_source_id_key;
ALTER TABLE public.candidates
  ADD CONSTRAINT candidates_source_source_id_key UNIQUE (source, source_id);

ALTER TABLE public.discovery_runs
  ADD COLUMN IF NOT EXISTS inserted_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS skipped_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS summary jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS candidates_set_updated_at ON public.candidates;
CREATE TRIGGER candidates_set_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

REVOKE ALL ON TABLE public.candidates FROM anon, authenticated;
REVOKE ALL ON TABLE public.discovery_runs FROM anon, authenticated;

ALTER FUNCTION public.set_updated_at() SET search_path = public;
