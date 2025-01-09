CREATE OR REPLACE FUNCTION public.accept_event_request(p_requester_id UUID, p_event_id UUID)
RETURNS VOID AS $$
DECLARE
  available_slots INTEGER;
BEGIN
  -- Get the number of available slots for the event
  SELECT participants_needed - COALESCE(COUNT(ep.joined_user_id), 0) INTO available_slots
  FROM public.events e
  LEFT JOIN public.event_participants ep ON e.id = ep.event_id
  WHERE e.id = p_event_id
  GROUP BY e.participants_needed;

  -- Check if there are available slots (creator is also safed in event_participants but not included in the participants_needed column, that is why we say >= 0 and not >= 1)
  IF available_slots >= 0 THEN
    UPDATE public.event_requests
    SET status = 'accepted'
    WHERE requester_id = p_requester_id AND event_id = p_event_id;
  ELSE
    RAISE EXCEPTION 'Cannot accept request: No available slots for event %', p_event_id;
  END IF;
END;
$$ LANGUAGE plpgsql;