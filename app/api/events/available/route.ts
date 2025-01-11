import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// um erstmal alles zu sehen ob es funktioniert
const DEFAULT_START_DATE = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();
const DEFAULT_END_DATE = new Date(2100, 0, 1).toISOString();

const DEFAULTS = {
  longitude: 13.405,
  latitude: 52.52,
  radius: 100_000_000, // um erstmal alles zu sehen ob es funktioniert
  sports: [
    "Soccer",
    "Basketball",
    "Tennis",
    "Volleyball",
    "Swimming",
    "Cycling",
    "Running",
    "Badminton",
    "Table Tennis",
    "Hiking",
  ],
  skill_levels: ["Beginner", "Amateur", "Medium", "Expert", "Irrelevant"],
  required_slots: 1,
};

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // parse params or fallback
    const longitude =
      parseFloat(searchParams.get("longitude") ?? "") || DEFAULTS.longitude;
    const latitude =
      parseFloat(searchParams.get("latitude") ?? "") || DEFAULTS.latitude;
    const radius =
      parseFloat(searchParams.get("radius") ?? "") || DEFAULTS.radius;
    const sports = searchParams.getAll("sports").length
      ? searchParams.getAll("sports")
      : DEFAULTS.sports;
    const skill_levels = searchParams.getAll("skill_levels").length
      ? searchParams.getAll("skill_levels")
      : DEFAULTS.skill_levels;
    const required_slots =
      parseInt(searchParams.get("required_slots") ?? "", 10) ||
      DEFAULTS.required_slots;
    const start_date =
      searchParams.get("start_date") || DEFAULT_START_DATE;
    const end_date =
      searchParams.get("end_date") || DEFAULT_END_DATE;

    const { data, error } = await supabase.rpc("get_filtered_events", {
      _longitude: longitude,
      _latitude: latitude,
      _radius: radius,
      _sports: sports,
      _skill_levels: skill_levels,
      _required_slots: required_slots,
      _start_date: start_date,
      _end_date: end_date,
    });

    if (error) {
      console.error("Error executing Supabase RPC (filtered events):", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ events: data }, { status: 200 });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
