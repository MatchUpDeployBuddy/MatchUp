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
    latitude double precision
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
        ST_Y(e.location::geometry) AS latitude
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
