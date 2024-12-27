export type Buddy = {
  id: string;
  name: string;
  updated_at: string;
  username: string;
  birthday: string;
  gender_enum: "male" | "female" | "other" | "prefer-not-to-say";
  sport_interest: string[];
  city: string;
  profile_picture: string;
};
