// providers/EventProvider.tsx
"use client";

import { useEffect } from "react";
import { useEventStore } from "@/store/eventStore";
import { useUserStore } from "@/store/userStore";
import { useOneSignalStore } from "@/store/oneSignalStore";

export function EventProvider({ children }: { children: React.ReactNode }) {
  const fetchEvents = useEventStore(state => state.fetchEvents);
  const isInitialized = useOneSignalStore((state) => state.isInitialized);
  const initializeOneSignal = useOneSignalStore(state => state.initializeOneSignal)
  const userId = useUserStore(state => state.user?.id);

  useEffect(() => {
    if (userId) {
      fetchEvents(userId);
    }
  }, [userId, fetchEvents]);

  useEffect(() => {
    if (userId && !isInitialized) {
      initializeOneSignal(userId);
    }
  }, [userId, initializeOneSignal, isInitialized]);

  return <>{children}</>;
}
