-- remove all triggers and functions
DROP TRIGGER IF EXISTS after_request_accepted ON event_requests;
DROP FUNCTION IF EXISTS handle_request_accepted;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- remove tables 
DROP TABLE IF EXISTS event_requests CASCADE;
DROP TYPE IF EXISTS request_status;
DROP TABLE IF EXISTS event_participants CASCADE;
DROP INDEX IF EXISTS idx_events_location;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- remove extensions
DROP EXTENSION IF EXISTS postgis CASCADE;
