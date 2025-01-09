CREATE OR REPLACE FUNCTION public.get_event_participants_names(event_uuid UUID)
RETURNS TABLE(name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.name::TEXT
  FROM public.event_participants ep
  JOIN public.users u ON ep.joined_user_id = u.id
  WHERE ep.event_id = event_uuid;
END;
$$ LANGUAGE plpgsql;