import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }

    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("creator_id", creatorId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", details: (error as Error).message },
      { status: 500 }
    );
  }
}
