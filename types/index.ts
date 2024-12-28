export type Buddy = {
  id: string;
  name: string;
  updated_at: string;
  email: string;
  username: string;
  birthday: string;
  gender_enum: "male" | "female" | "other" | "prefer-not-to-say";
  sport_interests: string[];
  city: string;
  profile_picture_url: string;
};
