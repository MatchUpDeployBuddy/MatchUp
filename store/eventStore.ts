// store/eventStore.ts
import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import { persist } from "zustand/middleware";
import { Tables } from "@/types/supabase";

interface EventState {
  events: Tables<"events">[];
  fetchEvents: (userId: string) => Promise<void>;
  setEvents: (events: Tables<"events">[]) => void;
  addEvent: (event: Tables<"events">) => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      events: [],
      fetchEvents: async (userId: string) => {
        try {
          const res = await fetch(`/api/get-joined-matches?id=${userId}`, {
            cache: "no-store",
          });
          if (!res.ok) throw new Error("Failed to fetch events");
          const data = await res.json();
          const eventList: Tables<"events">[] = data.map((wrapper: any) => wrapper.events);
          set({ events: eventList });
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      },
      setEvents: (events) => set({ events }),
      addEvent: (event: Tables<"events">) => {
        set((state) => ({
            events: [
                ...state.events,
                event
            ]
        }))
      },
    }),
    {
      name: "event-storage",
    }
  )
);
