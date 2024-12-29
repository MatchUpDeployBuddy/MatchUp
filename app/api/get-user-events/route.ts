import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

    console.log("Events:", events);
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
