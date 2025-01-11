CREATE OR REPLACE FUNCTION public.delete_event_participant(
    p_participant_id UUID, 
    p_event_id UUID
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.event_participants
  WHERE joined_user_id = p_participant_id AND event_id = p_event_id;

  RAISE NOTICE 'Participant with user_id % has been removed from event_id %', p_participant_id, p_event_id;
END;
$$ LANGUAGE plpgsql;