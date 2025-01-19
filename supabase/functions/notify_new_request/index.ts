import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import * as OneSignal from 'https://esm.sh/@onesignal/node-onesignal@1.0.0-beta7';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')!;
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const configuration = OneSignal.createConfiguration({
  appKey: ONESIGNAL_REST_API_KEY,
});

const onesignal = new OneSignal.DefaultApi(configuration);

serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    if (req.method !== 'POST') {
      console.warn('Invalid method:', req.method);
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await req.json();
    console.log('Parsed body:', body);

    const { type, record } = body;

    if (type === 'INSERT') {
      const { event_id: eventId, requester_id: requesterId } = record;

      const { data: eventData, error: eventError } = await supabase.from("events").select("creator_id").eq("id", eventId);
      
      if(eventError){
        console.log(eventError);
        return new Response('Error fetching creator', { status: 405 });
      }

      const { data: userData, error: userError } = await supabase.from("users").select("username").eq("id", requesterId);

      if(userError){
        console.log(userError);
        return new Response('Error fetching user', { status: 405 });
      }

      const creatorId = eventData[0].creator_id;
      const requestedUser = userData[0].username;

      const notification = new OneSignal.Notification();
      notification.app_id = ONESIGNAL_APP_ID;
      notification.contents = {
        en: `${requestedUser} wants to join your Match!`,
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
