import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(request: Request) {
  try {
    const { id, description } = await request.json();
    const supabase = await createClient();

    // Eventbeschreibung in der Datenbank aktualisieren
    const { error } = await supabase
      .from("events")
      .update({ description })
      .eq("id", id)
      .single(); // Nur ein Event zurückgeben

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Event description updated successfully" });
  } catch (error) {
    console.error("Error updating event description:", error);
    return NextResponse.json(
      { error: "Failed to update event description", details: (error as Error).message },
      { status: 500 }
    );
  }
}