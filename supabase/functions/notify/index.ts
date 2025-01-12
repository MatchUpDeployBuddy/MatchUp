import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import * as OneSignal from 'https://esm.sh/@onesignal/node-onesignal@1.0.0-beta7';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// OneSignal-Konfiguration
const ONESIGNAL_APP_ID = Deno.env.get('NEXT_PUBLIC_ONESIGNAL_APP_ID')!;
const ONESIGNAL_REST_API_KEY = Deno.env.get('NEXT_PUBLIC_ONESIGNAL_REST_API_KEY')!;
const SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')!;

const configuration = OneSignal.createConfiguration({
  appKey: ONESIGNAL_REST_API_KEY,
});

const onesignal = new OneSignal.DefaultApi(configuration);

// Supabase-Client erstellen
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req: Request) => {
  console.log('Webhook triggered:', req.method, req.url);

  try {
    // Überprüfen, ob die Anfrage POST ist
    if (req.method !== 'POST') {
      console.warn('Invalid method:', req.method);
      return new Response('Method not allowed', { status: 405 });
    }

    // Anfrage-Body parsen
    const body = await req.json();
    console.log('Parsed body:', body);

    const { eventType, record } = body;

    // Debugging: Event-Typ und Record
    console.log('Event Type:', eventType);
    console.log('Record:', record);

    // Authentifizierten Benutzer abrufen
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching authenticated user:', userError.message);
    }
    if (!user) {
      console.warn('User not authenticated or missing.');
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const userId = user.id;
    console.log('Authenticated user ID:', userId);

    if (eventType === 'INSERT') {
      const { creator_id: creatorId, event_name: eventName, sport } = record;

      console.log('Creator ID:', creatorId);
      console.log('Event Name:', eventName);
      console.log('Sport:', sport);

      // Überprüfen, ob der Benutzer der Ersteller des Events ist
      if (creatorId === userId) {
        console.log('User is the creator of the event.');

        const notification = new OneSignal.Notification();
        notification.app_id = ONESIGNAL_APP_ID;
        notification.contents = {
          en: `You just created a new event: ${eventName} (${sport})!`,
        };
        notification.include_external_user_ids = [record.user_id];

        try {
          // OneSignal-Benachrichtigung erstellen
          const onesignalApiRes = await onesignal.createNotification(notification);
          console.log('OneSignal API response:', onesignalApiRes);

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
      } else {
        console.log('User is not the creator of the event. No notification sent.');
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
