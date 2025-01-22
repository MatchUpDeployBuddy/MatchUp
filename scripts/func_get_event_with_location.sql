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