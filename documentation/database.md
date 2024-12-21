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
