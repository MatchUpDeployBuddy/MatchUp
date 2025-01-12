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

export type Event = {
  id: string; 
  creator_id: string;
  sport: string;
  participants_needed: number;
  skill_level: "Beginner" | "Amateur" | "Medium" | "Expert" | "Irrelevant";
  event_time: string;
  description: string;
  longitude: number;
  latitude: number;
  created_at: string;
  updated_at: string;
  event_name?: string | null,
};