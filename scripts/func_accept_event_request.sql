CREATE OR REPLACE FUNCTION public.accept_event_request(p_requester_id UUID, p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.event_requests
  SET status = 'accepted'
  WHERE requester_id = p_requester_id AND event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;
