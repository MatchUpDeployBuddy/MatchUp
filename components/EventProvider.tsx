// providers/EventProvider.tsx
"use client";

import { useEffect } from "react";
import { useEventStore } from "@/store/eventStore";
import { useUserStore } from "@/store/userStore";

export function EventProvider({ children }: { children: React.ReactNode }) {
  const fetchEvents = useEventStore(state => state.fetchEvents);
  const userId = useUserStore(state => state.user?.id);

  useEffect(() => {
    if (userId) {
      fetchEvents(userId);
    }
  }, [userId, fetchEvents]);

  return <>{children}</>;
}
