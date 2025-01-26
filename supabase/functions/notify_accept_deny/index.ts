import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import * as OneSignal from 'npm:onesignal-node';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')!;
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const client = new OneSignal.Client(ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY);

serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    if (req.method !== 'POST') {
      console.warn('Invalid method:', req.method);
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await req.json();

    const { type, record } = body;

    if (type === 'INSERT') {
      const { event_id: eventId, joined_user_id: joinedUserId } = record;

      const { data: eventData, error: eventError } = await supabase.from("events").select("creator_id, event_name").eq("id", eventId);

      if(eventError){
        console.log(eventError);
        return new Response('Error fetching event', { status: 405 });
      }

      if(joinedUserId === eventData[0].creator_id) {
        return new Response(
            JSON.stringify({ message: 'Event ignored.' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const event_name = eventData[0].event_name;

      const notification = {
        contents: { en: `You got accepted into ${eventData[0].event_name}!` },
        include_aliases: {
          external_id: [String(joinedUserId)]
        },
        target_channel: "push"
      };

      try {
        const onesignalApiRes = await client.createNotification(notification);

        return new Response(
          JSON.stringify({ onesignalResponse: onesignalApiRes }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      } catch (onesignalError) {
        console.error('Error sending OneSignal notification:', onesignalError);
        return new Response(
          JSON.stringify({ error: 'Failed to send notification' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } },
        );
      }

    }

    return new Response(
      JSON.stringify({ message: 'Event ignored.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});