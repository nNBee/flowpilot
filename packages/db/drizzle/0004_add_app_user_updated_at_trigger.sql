-- Custom SQL migration file, put your code below! --
CREATE TRIGGER app_user_set_updated_at
BEFORE UPDATE ON public.app_user
FOR EACH ROW
EXECUTE FUNCTION public.flowpilot_set_updated_at();