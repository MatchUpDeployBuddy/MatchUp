export type Buddy = {
  id?: string;
  name?: string | null;
  updated_at?: string | null;
  email?: string | null;
  username?: string | null;
  birthday?: string | null;
  gender_enum?: "male" | "female" | "other" | "prefer-not-to-say";
  sport_interests?: string[];
  city?: string | null;
  profile_picture_url?: string | null;
};
