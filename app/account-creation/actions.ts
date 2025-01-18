"use server";
import { createClient } from "@/utils/supabase/server";
import * as z from "zod";

const accountSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be 50 characters or less" }),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format",
  }),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    required_error: "Please select a gender",
  }),
  sportInterests: z
    .array(z.string())
    .min(1, { message: "Please select at least one sport" }),
  city: z.string().min(1, { message: "Please select a city" }),
  profilePicture: z.string().optional(),
});

export async function updateAccount(data: z.infer<typeof accountSchema>) {
  const supabase = await createClient();
  const parsedData = accountSchema.safeParse(data);
  if (!parsedData.success) {
    const errors = parsedData.error.errors.map((err) => err.message).join(", ");
    throw new Error(errors);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const userId = user.id;

  const { error } = await supabase
    .from("users")
    .update({
      username: parsedData.data.name,
      birthday: parsedData.data.birthday,
      gender: parsedData.data.gender,
      sport_interests: parsedData.data.sportInterests,
      city: parsedData.data.city,
      profile_picture_url: parsedData.data.profilePicture || null,
      is_profile_complete: true,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
