CREATE OR REPLACE FUNCTION public.reject_event_request(p_requester_id UUID, p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.event_requests
  SET status = 'rejected'
  WHERE requester_id = p_requester_id AND event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION delete_participant_on_reject()
RETURNS TRIGGER 
security definer
AS $$
BEGIN
  -- Check if the status is updated to 'rejected'
  IF NEW.status = 'rejected' THEN
    -- Delete the participant entry if it exists
    DELETE FROM public.event_participants
    WHERE event_id = NEW.event_id AND joined_user_id = NEW.requester_id;
  END IF;

  RETURN NEW; -- Return the new record
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reject_status_trigger
AFTER UPDATE OF status ON public.event_requests
FOR EACH ROW
when (new.status = 'rejected')
EXECUTE FUNCTION delete_participant_on_reject();
