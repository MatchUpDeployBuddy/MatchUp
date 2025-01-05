import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    // Extracting data from the request body
    const {
      sport,
      //location,
      participants_needed,
      skill_level,
      event_date, // 'event_date' is the date from the form
      event_time, // 'event_time' is the start time from the form
      description,
      userId, // The creator's userId (auth user)
    } = body;

    // Validate required fields
    /* if (!sport || !location || !participants_needed || !skill_level || !event_date || !event_time || !description) { */
    if (!sport || !participants_needed || !skill_level || !event_date || !event_time || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Combine date and time into a single timestamp (event_time)
    const eventDateTime = new Date(`${event_date}T${event_time}`);

    // Validate the description length (optional)
    if (description.length > 200) {
      return NextResponse.json(
        { error: "Description cannot be longer than 200 characters" },
        { status: 400 }
      );
    }

    // Insert event into the database
    const { error } = await supabase.from("events").insert({
      creator_id: userId, // Link the event to the creator's user ID
      sport,
      //location,
      participants_needed,
      skill_level,
      event_time: eventDateTime.toISOString(), // Save as ISO string or timestamp
      description,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: "Event created successfully" });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event", details: (error as Error).message },
      { status: 500 }
    );
  }
}
