import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Beispiel: http://localhost:3000/api/event-request
// Body {"event_id": "60199094-8cf5-485d-9361-829f9eb8b339","requester_id": "user-12345","message": "I would like to join this event!"}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { event_id, requester_id, message } = body;

    if (!event_id || !requester_id) {
      return NextResponse.json(
        { error: "Missing required fields: event_id, requester_id" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("event_requests").insert([
      {
        event_id,
        requester_id,
        messages: message,
      },
    ]);

    if (error) {
      console.error("Error inserting into event_requests:", error);
      return NextResponse.json(
        { error: "Failed to insert request into the database" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Request successfully created" },
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

// Beispiel: GET /api/event-request?eventId=60199094-8cf5-485d-9361-829f9eb8b339

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const eventId = searchParams.get("eventId");
    console.log(eventId);
    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId parameter" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("get_pending_requester_ids", {
      event_uuid: eventId,
    });

    if (error) {
      console.error("Error executing Supabase RPC:", { error, eventId });
      return NextResponse.json(
        { error: "Failed to fetch pending requesters from the database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ pendingRequesters: data }, { status: 200 });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
