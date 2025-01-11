import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { eventId, userId } = await request.json();

  try {
    // something like:
    // const { data, error } = await supabase
    //   .from('join_requests')
    //   .insert({ event_id: eventId, user_id: userId });

    // if (error) throw error;

    return NextResponse.json(
      { message: "Join request sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending join request:", error);
    return NextResponse.json(
      { error: "Failed to send join request" },
      { status: 500 }
    );
  }
}
