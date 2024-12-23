import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation
    const {
      name,
      birthday,
      gender,
      sportInterests,
      city,
      profilePicture,
      userId,
    } = body;

    if (!name || !birthday || !gender || !sportInterests || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert into the database
    const { error } = await supabase.from("accounts").insert({
      name,
      birthday,
      gender,
      sport_interests: sportInterests,
      city,
      profile_picture: profilePicture,
      user_id: userId, // Mit user ID verknüpfen hätte ich gesagt aber entscheidet ihr
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account", details: (error as Error).message },
      { status: 500 }
    );
  }
}
