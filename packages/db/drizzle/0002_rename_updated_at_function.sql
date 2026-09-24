-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION public.flowpilot_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER business_set_updated_at ON public.business;

CREATE TRIGGER business_set_updated_at
BEFORE UPDATE ON public.business
FOR EACH ROW
EXECUTE FUNCTION public.flowpilot_set_updated_at();

DROP FUNCTION public.set_updated_at();