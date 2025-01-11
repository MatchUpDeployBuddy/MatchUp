import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Beispiel: GET /api/events/requests?eventId=60199094-8cf5-485d-9361-829f9eb8b339

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
