-- install extension for postgis
create extension if not exists postgis;
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'prefer-not-to-say');

create table users (
    id uuid not null references auth.users on delete cascade,
    updated_at timestamp default now(),
    username TEXT NOT NULL CHECK (LENGTH(username) <= 100), -- Begrenzung auf 100 Zeichen
    birthday DATE,
    gender gender_enum,
    sport_interests TEXT[] NOT NULL DEFAULT '{}',
    city VARCHAR(100),
    profile_picture_url TEXT,
    is_profile_complete boolean,
    primary key (id)
);

alter table users enable row level security;

create policy "Public users are viewable by everyone." on users 
for select 
using (true);

CREATE POLICY "Users can update own profile."
  ON users 
  FOR UPDATE 
  using ( (select auth.uid()) = id)
  with check ( (select auth.uid()) = id);

REVOKE UPDATE ON TABLE users FROM public;
GRANT UPDATE (username) ON TABLE users TO public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Insert the new user into the users table with the email as the username
  insert into public.users (id, username)
  values (NEW.id, NEW.email);

  return new;
end;
$$;


create trigger on_auth_user_created
after insert ON auth.users
for each row
execute function public.handle_new_user();



create table events (
    id uuid primary key default gen_random_uuid(),
    creator_id uuid references users(id) on delete cascade not null,
    sport varchar(50) not null,
    participants_needed int not null check (participants_needed > 0),
    skill_level varchar(50) not null,
    event_time timestamp not null,
    description text,
    location geography(point, 4326) not null, -- geospalte für standort
    created_at timestamp default now(),
    updated_at timestamp default now()
);

create index idx_events_location on events using gist (location);

alter table events enable row level security;

create policy "public events are viewable by everyone." on events
for select
using (true);

create policy "users can insert events." on events
for insert
with check ( (select auth.uid()) = creator_id);

create policy "users can update their own events." on events
for update
using ( (select auth.uid()) = creator_id)
with check ( (select auth.uid()) = creator_id);

create policy "users can delete their own events." on events
for delete
using ( (select auth.uid()) = creator_id);

REVOKE INSERT (id, created_at, updated_at) ON TABLE events FROM public;
REVOKE UPDATE (id, created_at) ON TABLE events FROM public;



create table event_participants (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references events(id) on delete cascade,
    joined_user_id uuid references users(id) on delete cascade,
    joined_at timestamp default now(),
    unique (event_id, joined_user_id) 
);

alter table event_participants enable row level security;

create policy "event participants are viewable by everyone." on event_participants
for select
using (true);

CREATE POLICY "event creators can delete participants from their events" 
ON public.event_participants
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM public.events e 
    WHERE e.id = event_participants.event_id 
    AND e.creator_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION update_event_request_status_on_participant_delete()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
  -- Update the status to 'rejected' for the specific user and event
  DELETE FROM public.event_requests
  WHERE requester_id = OLD.joined_user_id AND event_id = OLD.event_id;

  RETURN NULL; -- No need to return anything
END;
$$ LANGUAGE plpgsql; 

CREATE TRIGGER participant_delete_trigger
AFTER DELETE ON public.event_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_event_request_status_on_participant_delete();




create type request_status as enum ('pending', 'accepted', 'rejected');

create table event_requests (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references events(id) on delete cascade,
    requester_id uuid references users(id) on delete cascade,
    status request_status not null default 'pending', 
    created_at timestamp default now(),
    messages VARCHAR(500) DEFAULT '',
    unique (event_id, requester_id) 
);

alter table event_requests enable row level security;

CREATE POLICY "users can request to join events" 
ON event_requests
FOR INSERT
WITH CHECK (
  (select auth.uid()) = requester_id AND 
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id)
);

create policy "event creators can view requests for their events" on event_requests
for select
using ((select auth.uid()) in (select creator_id from events where events.id = event_id));

create policy "event creators can manage requests" on event_requests
for update
using ((select auth.uid()) in (select creator_id from events where events.id = event_id));

REVOKE INSERT (id, status, created_at) ON TABLE event_requests FROM public;
REVOKE UPDATE ON TABLE event_requests FROM public;
GRANT UPDATE (status) ON TABLE event_requests TO public;

CREATE OR REPLACE FUNCTION handle_request_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM event_participants
      WHERE event_id = NEW.event_id AND joined_user_id = NEW.requester_id
    ) THEN
      INSERT INTO event_participants (event_id, joined_user_id)
      VALUES (NEW.event_id, NEW.requester_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


create trigger after_request_accepted
after update on event_requests
for each row
when (new.status = 'accepted')
execute function handle_request_accepted();



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



create table messages (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references events(id) on delete cascade,
    sender_id uuid references users(id) on delete cascade,
    content text not null,
    created_at timestamp default now()
);

alter table messages enable row level security;

create policy "Only participants can read messages in their events" 
on messages
for select
using (
  (select auth.uid()) in (
    select joined_user_id 
    from event_participants 
    where event_id = messages.event_id
  )
);

create policy "Only participants can insert messages in their events"
on messages
for insert
with check (
  (select auth.uid()) in (
    select joined_user_id 
    from event_participants 
    where event_id = messages.event_id
  )
);

CREATE POLICY "Users can delete their own participation records." 
ON public.event_participants 
FOR DELETE 
USING (auth.uid() = joined_user_id);



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


-- Create or replace the function to delete user profile pictures
CREATE OR REPLACE FUNCTION delete_user_picture()
RETURNS TRIGGER AS $$
DECLARE
  extension TEXT;
BEGIN

  PERFORM storage.delete_object('profile_pictures', OLD.id || '.' || 'jpg');
  PERFORM storage.delete_object('profile_pictures', OLD.id || '.' || 'JPG');
  PERFORM storage.delete_object('profile_pictures', OLD.id || '.' || 'png');
  PERFORM storage.delete_object('profile_pictures', OLD.id || '.' || 'PNG');

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on the auth.users table
CREATE TRIGGER on_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION delete_user_picture();

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

CREATE OR REPLACE FUNCTION public.get_event_with_location(p_id UUID)
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  sport VARCHAR,
  participants_needed INT,
  skill_level VARCHAR,
  event_time TIMESTAMP,
  description TEXT,
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  event_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.creator_id,
    e.sport,
    e.participants_needed,
    e.skill_level,
    e.event_time,
    e.description,
    ST_X(e.location::geometry) AS longitude,
    ST_Y(e.location::geometry) AS latitude,
    e.created_at,
    e.updated_at,
    e.event_name
  FROM public.events AS e
  WHERE e.id = p_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_filtered_events(
    _longitude           double precision,
    _latitude            double precision,
    _radius              double precision,      -- Radius in Metern
    _sports              text[],
    _skill_levels        text[],
    _required_slots      int,                   -- Mindestanzahl verfügbarer Plätze
    _start_date          timestamp,
    _end_date            timestamp
)
RETURNS TABLE (
    id uuid,
    creator_id uuid,
    sport varchar(50),
    participants_needed int,
    available_slots int,                      
    skill_level varchar(50),
    event_time timestamp,
    description text,
    longitude double precision,
    latitude double precision,
    event_name text                             -- Hinzugefügt
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.creator_id,
        e.sport,
        e.participants_needed,
        (e.participants_needed - COALESCE(ep.count, 0))::integer AS available_slots,
        e.skill_level,
        e.event_time,
        e.description,
        ST_X(e.location::geometry) AS longitude, 
        ST_Y(e.location::geometry) AS latitude,
        e.event_name                                -- Hinzugefügt
    FROM events e
    LEFT JOIN (
        SELECT event_id, COUNT(*) AS count
        FROM event_participants
        GROUP BY event_id
    ) ep ON e.id = ep.event_id
    WHERE 
        e.sport = ANY(_sports)
        AND e.skill_level = ANY(_skill_levels)
        AND (e.participants_needed - COALESCE(ep.count, 0)) >= _required_slots
        AND e.event_time BETWEEN _start_date AND _end_date
        AND e.location IS NOT NULL
        AND ST_DWithin(
            e.location,
            ST_SetSRID(ST_MakePoint(_longitude, _latitude), 4326)::geography,
            _radius
        )
        AND e.creator_id != auth.uid(); 
END;
$$;


CREATE OR REPLACE FUNCTION public.get_pending_requester_ids(event_uuid UUID)
RETURNS TABLE(requester_id UUID, user_name TEXT, message TEXT, profile_picture_url TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT er.requester_id, 
         u.username::TEXT, 
         er.messages::TEXT ,
         u.profile_picture_url::TEXT
  FROM public.event_requests er
  JOIN public.users u ON er.requester_id = u.id
  WHERE er.event_id = event_uuid 
  AND er.status = 'pending';
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.insert_creator_as_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

  RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reject_status_trigger
AFTER UPDATE OF status ON public.event_requests
FOR EACH ROW
when (new.status = 'rejected')
EXECUTE FUNCTION delete_participant_on_reject();
