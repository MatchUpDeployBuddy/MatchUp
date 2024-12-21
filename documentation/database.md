## 1. Deployment & Clean up
Execute the create_schema.sql file (e.g. in the sql editor from supabase) to create the whole database environment.

Run clean up script (clean_up.sql) to remove all ressources regarding the database from supabase. Important if you remove users table you also have to remove the users from the auth table. This is not covered by the script.  

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


## 2. Tables and Their Functions

### **2.1. Table: `users`**
- **Trigger**:
  - `on_auth_user_created`: Automatically creates a new entry in the `users` table whenever a new user is added to `auth.users`.
- **Row-Level Security (RLS)**:
  - `Public users are viewable by everyone.`: Grants read access to all users.
  - `Users can update own profile.`: Allows authenticated users to update only their own profiles (using + with check auth.id = user.id).

---

### **2.2. Table: `events`**
- **Index**:
  - `idx_events_location`: GIST index used to optimize queries involving geographical data (e.g., location-based searches).
- **Row-Level Security (RLS)**:
  - `public events are viewable by everyone.`: Grants read access to all events.
  - `users can insert events.`: Allows authenticated users to create events (using auth.id = user.id).
  - `users can update their own events.`: Allows users to modify only the events they created (using + with check auth.id = user.id).
  - `users can delete their own events.`: Allows users to delete only the events they created (using auth.id = user.id).

---

### **2.3. Table: `event_participants`**
- **Row-Level Security (RLS)**:
  - `event participants are viewable by everyone.`: Grants read access to all participation records.
