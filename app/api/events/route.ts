import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');


    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    const { error } = await supabase.from("events").delete().eq("id", id);

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
