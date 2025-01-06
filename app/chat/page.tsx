"use client";
import React, { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { Tables } from "@/types/supabase";
import { Avatar,  } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useRouter } from 'next/navigation'
type EventWrapper = {
    events: Tables<"events">;
};

export default function Chat() {
    const user = useUserStore((state) => state.user)
    const [events, setEvents] = useState<Tables<"events">[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!user?.id) return; 

        const fetchEvents = async (): Promise<void> => {
            setLoading(true);
            try {
                const res = await fetch(`/api/get-joined-matches?id=${user.id}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch events");
                }
                const data: EventWrapper[] = await res.json();
                const eventList = data.map(wrapper => wrapper.events);
                setEvents(eventList);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [user]);


    return (
        <div className="p-6 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Good Morning 🔥</h2>
          <h1 className="text-2xl font-bold mb-4">{user?.name}</h1>
          <h3 className="text-lg font-medium mb-4">Your MATCH chats</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scroll-smooth">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center p-4 rounded-lg shadow-md bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/chat/${event.id}`)}
              >
                <Avatar className="w-12 h-12 rounded-full object-cover mr-4">
                  <AvatarImage
                    src={"U"}
                    alt="Profile picture"
                    className="object-cover w-full h-full"
                  />
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{event.sport}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
}