import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Beispiel: PATCH /api/event-request/accept
// Body: { "requesterId": "123e4567-e89b-12d3-a456-426614174000", "eventId": "60199094-8cf5-485d-9361-829f9eb8b339" }

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { requesterId, eventId } = body;

    if (!requesterId || !eventId) {
      return NextResponse.json(
        { error: "Missing requesterId or eventId in the request body" },
        { status: 400 }
      );
    }

    const { error } = await supabase.rpc("accept_event_request", {
      p_requester_id: requesterId,
      p_event_id: eventId,
    });

    if (error) {
      console.error("Error executing Supabase RPC:", {
        error,
        requesterId,
        eventId,
      });
      return NextResponse.json(
        { error: "Failed to accept event request in the database" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Event request successfully accepted" },
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
