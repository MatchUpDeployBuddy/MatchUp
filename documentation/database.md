## 1. Instructions for Database Setup and Cleanup

### 1. Setting up the Database
To set up the entire database environment:
1. Open the SQL editor in Supabase (or any preferred SQL interface).
2. Execute the `create_schema.sql` file to create all the required tables, triggers, policies, and extensions for the application.

### 2. Cleaning up the Database
To clean up and remove all database resources:
1. Execute the `clean_up.sql` file in the SQL editor.
   - This script will delete all tables, triggers, and extensions created by the schema.
2. **Important Note**: The script does not handle the removal of users from the `auth` table. If you delete entries from the `users` table, you must manually remove the corresponding users from the `auth` table to avoid inconsistencies.

Make sure to double-check the `auth` table after cleanup to ensure no orphaned user data remains.

## Tables and Their Functions

### **2.1. Table: `users`**
- **Description**: Stores user data and links to the `auth.users` table, ensuring automatic cascading on user deletion.
- **Special Properties**:
  - `name`: Unique and required, ensuring no duplicate user names in the table.
- **Trigger**:
  - `on_auth_user_created`: Automatically creates a new entry in the `users` table whenever a new user is added to `auth.users`.
- **Row-Level Security (RLS)**:
  - `Public users are viewable by everyone.`: Grants read access to all users.
  - `Users can update own profile.`: Allows authenticated users to update only their own profiles (`auth.uid() = id`).
- **Privileges**:
  - `REVOKE UPDATE` on all columns except `name` for public.
  - `GRANT UPDATE` on `name` for public.

---

### **2.2. Table: `events`**
- **Description**: Stores event details, including creator information, sport type, and geographic location using PostGIS.
- **Index**:
  - `idx_events_location`: GIST index used to optimize queries involving geographical data (e.g., location-based searches).
- **Special Properties**:
  - `location`: A `geography` column storing geographic points with SRID 4326 for spatial queries.
- **Row-Level Security (RLS)**:
  - `public events are viewable by everyone.`: Grants read access to all events.
  - `users can insert events.`: Allows authenticated users to create events (`auth.uid() = creator_id`).
  - `users can update their own events.`: Allows users to modify only the events they created (`auth.uid() = creator_id`).
  - `users can delete their own events.`: Allows users to delete only the events they created (`auth.uid() = creator_id`).
- **Privileges**:
  - `REVOKE INSERT` on columns `id`, `created_at`, and `updated_at`.
  - `REVOKE UPDATE` on columns `id` and `created_at`.

---

### **2.3. Table: `event_participants`**
- **Description**: Manages participant information for events, ensuring no duplicate participants for the same event.
- **Special Properties**:
  - `unique (event_id, joined_user_id)`: Ensures that a user can only join a specific event once.
- **Row-Level Security (RLS)**:
  - `event participants are viewable by everyone.`: Grants read access to all participation records.

---

### **2.4. Table: `event_requests`**
- **Description**: Handles join requests for events, with a status field to track request progression.
- **Special Properties**:
  - `status`: An enumerated type (`pending`, `accepted`, `rejected`) to track the state of the request. Default value: `pending`.
  - `unique (event_id, requester_id)`: Ensures that a user can only request to join a specific event once.
- **Row-Level Security (RLS)**:
  - `users can request to join events`: Allows authenticated users to insert requests (`auth.uid() = requester_id`).
  - `event creators can view requests for their events`: Grants event creators read access to requests for their events.
  - `event creators can manage requests`: Allows event creators to update request statuses for their events.
- **Privileges**:
  - `REVOKE INSERT` on columns `id`, `status`, and `created_at`.
  - `REVOKE UPDATE` on all columns.
  - `GRANT UPDATE` on `status` for public.
- **Trigger**:
  - `after_request_accepted`: Automatically adds a user to the `event_participants` table when their request status is updated to `accepted`.

---

### **Custom Data Types**
- **Type: `request_status`**
  - Enum type with values: `pending`, `accepted`, `rejected`.
  - Used in the `event_requests` table to track the state of a request.
