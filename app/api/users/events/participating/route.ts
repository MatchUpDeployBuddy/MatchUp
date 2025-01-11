import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    // Supabase-Client erstellen
    const supabase = await createClient();

    // Extrahiere die Query-Parameter aus der URL
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creatorId");

    // Überprüfe, ob die creatorId angegeben wurde
    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }

    // Datenbankabfrage: Events nach creatorId filtern
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("creator_id", creatorId);

    // Überprüfe auf Fehler bei der Abfrage
    if (error) {
      throw new Error(error.message);
    }

    // Gebe die abgerufenen Events als JSON zurück
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: (error as Error).message },
      { status: 500 }
    );
  }
}

const userSchema = z.object({
  userId: z.string(),
  username: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be 50 characters or less" }),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format",
  }),
  sportInterests: z
    .array(z.string())
    .min(1, { message: "Please select at least one sport" }),
  city: z.string().min(1, { message: "Please select a city" }),
  profilePicture: z
    .string()
    .url({ message: "Please upload a profile picture" })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const parsedData = userSchema.safeParse(body);

    if (!parsedData.success) {
      const errors = parsedData.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { userId, ...updateData } = parsedData.data;

    const { data, error } = await supabase
      .from("users")
      .update({
        username: updateData.username,
        birthday: updateData.birthday,
        sport_interests: updateData.sportInterests,
        city: updateData.city,
        profile_picture_url: updateData.profilePicture || null,
      })
      .eq("id", userId)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: "User updated successfully", data },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
