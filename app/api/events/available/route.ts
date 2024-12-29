import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function validateUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url)

    const longitude = parseFloat(searchParams.get('longitude') ?? '13.4050'); // Berlin Longitude as default
    const latitude = parseFloat(searchParams.get('latitude') ?? '52.5200');   // Berlin Latitude as default
    const radius = parseFloat(searchParams.get('radius') ?? '1000');          // 1000 meter as default
    
    const sports = searchParams.has('sports') ? searchParams.getAll('sports') : ['Soccer']
    const skill_levels = searchParams.has('skill_levels') ? searchParams.getAll('skill_levels') : ['Intermediate']

    const required_slots = searchParams.has('required_slots') ? parseInt(searchParams.get('required_slots') as string) : 1;   
    
    const now = new Date();
    const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // two days later
    const start_date = searchParams.get('start_date') || now.toISOString(); 
    const end_date = searchParams.get('end_date') || twoDaysLater.toISOString();

    const auth_id = searchParams.get('auth_id') || '00000000-0000-0000-0000-000000000000' // Default UUID

    if (!validateUUID(auth_id)) {
      return NextResponse.json({ error: "invalid auth_id UUID" }, { status: 400 })
    }

    const params = {
      _longitude: longitude,
      _latitude: latitude,
      _radius: radius,
      _sports: sports,
      _skill_levels: skill_levels,
      _required_slots: required_slots,
      _start_date: start_date,
      _end_date: end_date,
      _auth_id: auth_id
    }

    const { data, error } = await supabase.rpc('get_filtered_events', params)

    if (error) {
      console.error('RPC-error:', error)
      return NextResponse.json(
        { error: "Error when retrieving the filtered events" },
        { status: 500 }
      )
    }

    return NextResponse.json({ events: data }, { status: 200 })

  } catch (err) {
    console.error('Server error:', err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
