-- Create or replace the function to delete user profile pictures
CREATE OR REPLACE FUNCTION delete_user_picture()
RETURNS TRIGGER AS $$
DECLARE
  extension TEXT;
BEGIN

  PERFORM storage.delete_object('profile_pictures', OLD.id || '.' || 'jpg');
  PERFORM storage.delete_object('profile_pictures', OLD.id || '.' || 'JPG');
  PERFORM storage.delete_object('profile_pictures', OLD.id || '.' || 'png');
  PERFORM storage.delete_object('profile_pictures', OLD.id || '.' || 'PNG');

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on the auth.users table
CREATE TRIGGER on_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION delete_user_picture();