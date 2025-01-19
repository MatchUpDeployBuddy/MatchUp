CREATE OR REPLACE FUNCTION public.get_event_participants_names(event_uuid UUID)
RETURNS TABLE(joined_user_id UUID, name TEXT, profile_picture_url TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT ep.joined_user_id, u.username::TEXT, u.profile_picture_url::TEXT
  FROM public.event_participants ep
  JOIN public.users u ON ep.joined_user_id = u.id
  WHERE ep.event_id = event_uuid;
END;
$$ LANGUAGE plpgsql;