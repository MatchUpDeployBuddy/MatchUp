import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULTS = {
  longitude: 13.4050,
  latitude: 52.5200,
  radius: 1000,
  sports: ['Soccer'],
  skill_levels: ['Intermediate'],
  required_slots: 1,
};

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const params = {
      _longitude: parseFloat(searchParams.get('longitude') ?? String(DEFAULTS.longitude)),
      _latitude: parseFloat(searchParams.get('latitude') ?? String(DEFAULTS.latitude)),
      _radius: parseFloat(searchParams.get('radius') ?? String(DEFAULTS.radius)),
      _sports: searchParams.getAll('sports').length > 0 ? searchParams.getAll('sports') : DEFAULTS.sports,
      _skill_levels: searchParams.getAll('skill_levels').length > 0 ? searchParams.getAll('skill_levels') : DEFAULTS.skill_levels,
      _required_slots: parseInt(searchParams.get('required_slots') ?? String(DEFAULTS.required_slots), 10),
      _start_date: searchParams.get('start_date') || new Date().toISOString(),
      _end_date: searchParams.get('end_date') || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data, error } = await supabase.rpc('get_filtered_events', params);

    if (error) {
      console.error('Error executing Supabase RPC:', { error, params });
      return NextResponse.json({ error: "Failed to fetch events from the database" }, { status: 500 });
    }

    return NextResponse.json({ events: data }, { status: 200 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
