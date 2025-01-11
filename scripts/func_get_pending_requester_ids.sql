CREATE OR REPLACE FUNCTION public.get_pending_requester_ids(event_uuid UUID)
RETURNS TABLE(requester_id UUID, user_name TEXT, message TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT er.requester_id, 
         u.name::TEXT, 
         er.messages::TEXT 
  FROM public.event_requests er
  JOIN public.users u ON er.requester_id = u.id
  WHERE er.event_id = event_uuid 
  AND er.status = 'pending';
END;
$$ LANGUAGE plpgsql;
