import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Beispiel: GET /api/event-participants?eventId=60199094-8cf5-485d-9361-829f9eb8b339

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId parameter" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("get_event_participants_names", {
      event_uuid: eventId,
    });

    if (error) {
      console.error("Error executing Supabase RPC:", { error, eventId });
      return NextResponse.json(
        { error: "Failed to fetch participants from the database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ participants: data }, { status: 200 });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




// DELETE /api/event-participant?participantId=123e4567-e89b-12d3-a456-426614174000&eventId=60199094-8cf5-485d-9361-829f9eb8b339

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const participantId = searchParams.get('participantId');
    const eventId = searchParams.get('eventId');

    if (!participantId || !eventId) {
      return NextResponse.json(
        { error: "Missing participantId or eventId in the query parameters" },
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