import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { id } = await request.json(); // Event-ID aus der Anfrage abrufen

    if (!id) {
      return NextResponse.json(
        { error: "Missing event ID" },
        { status: 400 }
      );
    }

    // Event aus der Datenbank löschen
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id); // Event mit der angegebenen ID löschen

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event", details: (error as Error).message },
      { status: 500 }
    );
  }
}
