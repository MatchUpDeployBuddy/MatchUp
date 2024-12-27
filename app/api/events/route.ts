import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.rpc('get_events_with_coordinates')

        if (error) {
            console.error("Fehler beim Abrufen der Events:", error);
            return NextResponse.json(
                { error: `Fehler beim Abrufen der Events: ${error.message}` },
                { status: 500 }
            );
        }
        console.log(data);
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("Unerwarteter Fehler:", err);
        let errorMessage = "Ein unbekannter Fehler ist aufgetreten.";
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') { // Zusätzliche Prüfung für String-Fehler
            errorMessage = err;
        }
        return NextResponse.json(
            { error: `Unerwarteter Fehler: ${errorMessage}` },
            { status: 500 }
        );
    }
    
}