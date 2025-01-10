import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// DELETE /api/event-participant
// Body: { "participantId": "123e4567-e89b-12d3-a456-426614174000", "eventId": "60199094-8cf5-485d-9361-829f9eb8b339" }

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { participantId, eventId } = body;

    if (!participantId || !eventId) {
      return NextResponse.json(
        { error: "Missing participantId or eventId in the request body" },
        { status: 400 }
      );
    }

    const { error } = await supabase.rpc("delete_event_participant", {
      p_participant_id: participantId,
      p_event_id: eventId,
    });

    if (error) {
      console.error("Error executing Supabase RPC:", {
        error,
        participantId,
        eventId,
      });
      return NextResponse.json(
        { error: "Failed to delete event participant in the database" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Event participant successfully deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
