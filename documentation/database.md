# Database Table Description

## Tables

### `users`

Stores user data and links to the `auth.users` table. Ensures automatic cascading on user deletion to maintain data integrity.

### `events`

Stores event details. Includes information about the event creator. Tracks the sport type associated with the event. Utilizes PostGIS for geographic location data to enable spatial queries.

### `event_participants`

Manages participant information for events. Ensures no duplicate participants are added to the same event.

### `event_requests`

Handles join requests for events. Contains a `status` field to track the progression of each request (e.g., pending, approved, rejected).

### `messages`

Handles all sent messages between users.
