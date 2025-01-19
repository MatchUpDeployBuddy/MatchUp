CREATE OR REPLACE FUNCTION public.accept_event_request(
    p_requester_id UUID, 
    p_event_id UUID
)
RETURNS TABLE(requester_id UUID, user_name TEXT, profile_picture_url TEXT) AS $$
DECLARE
  available_slots INTEGER;
BEGIN
  -- Get the number of available slots for the event
  SELECT e.participants_needed - COALESCE(COUNT(ep.joined_user_id), 0) INTO available_slots
  FROM public.events e
  LEFT JOIN public.event_participants ep ON e.id = ep.event_id
  WHERE e.id = p_event_id
  GROUP BY e.participants_needed;

  -- Check if there are available slots
  IF available_slots > 0 THEN
    -- Update the status to 'accepted'
    UPDATE public.event_requests
    SET status = 'accepted'
    WHERE event_requests.requester_id = p_requester_id AND event_requests.event_id = p_event_id;

    -- Return the requester_id and corresponding username
    RETURN QUERY
    SELECT p_requester_id AS requester_id, u.username::TEXT AS user_name, u.profile_picture_url::TEXT
    FROM public.users u
    WHERE u.id = p_requester_id;
  ELSE
    RAISE EXCEPTION 'Cannot accept request: No available slots for event %', p_event_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
