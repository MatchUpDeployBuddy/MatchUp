CREATE OR REPLACE FUNCTION public.insert_creator_as_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert the creator as a participant in the event_participants table
    INSERT INTO event_participants (event_id, joined_user_id)
    VALUES (NEW.id, NEW.creator_id);
    
    RETURN NEW;
END;
$$;

-- Create the trigger that calls the function after an event is inserted
CREATE TRIGGER after_event_insert
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION public.insert_creator_as_participant();