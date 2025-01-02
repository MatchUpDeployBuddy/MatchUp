"use client";

import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TmpClientComponent from "../TmpClientComponent/TmpClientComponent";
import { logout } from "../logout/action";
import Link from "next/link";
import { EventCard } from "@/components/ui/event-card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";


interface Event {
  id: string;
  sport: string;
  event_time: string;
}

interface DashboardProps {
  userId: string;
}

export default function DashboardComponent({ userId }: DashboardProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  console.log("user dashboard", user);

  // Fetch user events
  useEffect(() => {
    async function fetchUserEvents() {
      setLoadingEvents(true);
      try {
        const res = await fetch(`/api/get-user-matches?creatorId=${userId}`, {
          cache: "no-store",
        });
        const data: Event[] = await res.json();

        // Filter nur zukünftige Events
        const now = new Date();
        const futureEvents = data.filter((event) => new Date(event.event_time) > now);

        setEvents(futureEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchUserEvents();
  }, [userId]);


  if (!user) {
    return <p className="m-4">No user found.</p>;
  }
  const handleLogout = async () => {
    const result = await logout();
    if (result?.success) {
      clearUser();
      router.push("/");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">MatchUp Dashboard</h1>

      <div className="flex justify-between items-center mb-6">
        <TmpClientComponent />
        <h2 className="text-3xl font-bold">Hello {user?.username}</h2>

        <Button onClick={handleLogout}>Logout</Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/match-creation">
          <Button className="h-20 w-full">Create Event</Button>
        </Link>
        <Button variant="outline" className="h-20">
          Find Teammates
        </Button>
        <Button variant="outline" className="h-20">
          Beginner&apos;s Guide
        </Button>
      </div>

      {/* Active MATCHES*/}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active MATCHES</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEvents ? (
            <p>Loading events...</p>
          ) : events.length > 0 ? (
            <ul>
              {events.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </ul>
          ) : (
            <p>No upcoming events found.</p>
          )}
        </CardContent>
      </Card>

      {/* Discover Events */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Discover Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Events you can join will be displayed here.</p>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Recent activities from your network will be shown here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
