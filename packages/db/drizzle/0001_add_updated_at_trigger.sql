-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_set_updated_at
BEFORE UPDATE ON business
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();