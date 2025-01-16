// store/eventStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Event } from "@/types";


interface EventState {
  events: Event[];
  fetchEvents: (userId: string) => Promise<void>;
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      events: [],
      fetchEvents: async (userId: string) => {
        try {
          const res = await fetch(`/api/get-joined-events?id=${userId}`, {
            cache: "no-store",
          });
          if (!res.ok) throw new Error("Failed to fetch events");
          const data = await res.json();
          set({ events: data });
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      },
      setEvents: (events) => set({ events }),
      addEvent: (event: Event) => {
        set((state) => ({
            events: [
                ...state.events,
                event
            ]
        }))
      },
      removeEvent: (eventId: string) => {
        set((state) => ({
          events: state.events.filter(event => event.id !== eventId),
        }));
      }
    }),
    {
      name: "event-storage",
    }
  )
);
