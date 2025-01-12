import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import * as OneSignal from 'https://esm.sh/@onesignal/node-onesignal@1.0.0-beta7';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')!;
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')!;

const configuration = OneSignal.createConfiguration({
  appKey: ONESIGNAL_REST_API_KEY,
});

const onesignal = new OneSignal.DefaultApi(configuration);

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

    const { type, record } = body;

    if (type === 'INSERT') {
      const { creator_id: creatorId, event_name: eventName, sport } = record;

      const notification = new OneSignal.Notification();
      notification.app_id = ONESIGNAL_APP_ID;
      notification.contents = {
        en: `You just created a new event: ${eventName} (${sport})!`,
      };
      notification.include_external_user_ids = [creatorId];

      try {
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
