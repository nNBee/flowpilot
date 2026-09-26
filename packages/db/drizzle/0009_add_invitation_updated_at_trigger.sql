-- Custom SQL migration file, put your code below! --
CREATE TRIGGER invitation_set_updated_at
BEFORE UPDATE ON public.invitation
FOR EACH ROW
EXECUTE FUNCTION public.flowpilot_set_updated_at();