SELECT *
FROM get_filtered_events(
  -73.935242,               -- _longitude
  40.73061,               -- _latitude
  1000,                    -- _radius in Metern
  ARRAY['Soccer'],     -- _sports
  ARRAY['Intermediate'], -- _skill_levels
  10,                       -- _participants_needed
  '2023-10-14 15:00:00',   -- _start_date
  '2023-10-16 15:00:00',   -- _end_date
  '00336445-4491-40e8-9a15-5aec315b0849'         -- _auth_id
);


