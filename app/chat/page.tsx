"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { Avatar,  } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useRouter } from 'next/navigation'
import { getSportImage } from "@/utils/supabase/match-images"; 
import { useEventStore } from "@/store/eventStore";

type SportImage = {
  [sport: string]: string;
};

export default function Chat() {
    const user = useUserStore((state) => state.user)
    const [sportImages, setSportImages] = useState<SportImage>({});
    const router = useRouter();
    const events = useEventStore((state) => state.events);

  // Fetch sport images for events
  const fetchPictures = useCallback(async () => {
    const fetchImage = async (sport: string) => {
      try {
        const imageUrl = await getSportImage(sport);
        setSportImages((prev) => ({
          ...prev,
          [sport]: imageUrl,
        }));
      } catch (error) {
        console.error(`Error fetching image for sport "${sport}":`, error);
      }
    };

    for (const event of events) {
      const sport = event.sport;
      if (!sportImages[sport]) {
        await fetchImage(sport);
      }
    }
  }, [events, sportImages]);

  // Fetch images when events change
  useEffect(() => {
    if (events.length > 0) {
      fetchPictures();
    }
  }, [events, fetchPictures]);

    return (
        <div className="p-6 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Good Morning 🔥</h2>
          <h1 className="text-2xl font-bold mb-4">{user?.name}</h1>
          <h3 className="text-lg font-medium mb-4">Your MATCH chats</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scroll-smooth">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="flex items-center p-4 rounded-lg shadow-md bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/chat/${event.event_id}`)}
              >
                <Avatar className="w-12 h-12 rounded-full object-cover mr-4">
                  <AvatarImage
                    src={sportImages[event.sport]}
                    alt="Profile picture"
                    className="object-cover w-full h-full"
                  />
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{event.event_name || event.sport}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
}