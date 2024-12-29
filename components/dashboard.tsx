"use client";

import { useEffect, useState } from "react";
import { Buddy } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TmpClientComponent from "../app/TmpClientComponent/TmpClientComponent";
import { logout } from "../app/logout/action";
import Link from "next/link";
import { EventCard } from "./ui/event-card";

interface DashboardProps {
  userId: string;
}

interface Event {
  id: string;
  sport: string;
  event_time: string;
}

export default function DashboardComponent({ userId }: DashboardProps) {
  const [user, setUser] = useState<Buddy | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const res = await fetch(`/api/get-user?id=${userId}`, {
          cache: "no-store",
        });
        const data: Buddy = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  // Fetch user events
  useEffect(() => {
    async function fetchUserEvents() {
      setLoadingEvents(true);
      try {
        const res = await fetch(`/api/get-user-events?creatorId=${userId}`, {
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

  if (loading) {
    return <p className="m-4">Loading user data...</p>;
  }

  if (!user) {
    return <p className="m-4">No user found.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">MatchUp Dashboard</h1>

      <div className="flex justify-between items-center mb-6">
        <TmpClientComponent />
        <h2 className="text-3xl font-bold">Hello {user.username}</h2>

        <form action={logout}>
          <Button type="submit">Logout</Button>
        </form>
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
