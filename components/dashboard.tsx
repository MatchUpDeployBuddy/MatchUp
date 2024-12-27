"use client";

import { useEffect, useState } from "react";
import { Buddy } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TmpClientComponent from "../app/TmpClientComponent/TmpClientComponent";
import { logout } from "../app/logout/action";

interface DashboardProps {
  userId: string;
}

export default function DashboardComponent({ userId }: DashboardProps) {
  const [user, setUser] = useState<Buddy | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data in the browser (client side) using the userId
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

  // Show a loading state while fetching
  if (loading) {
    return <p className="m-4">Loading user data...</p>;
  }

  // If there's no user data returned
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
        <Button className="h-20">Create Event</Button>
        <Button variant="outline" className="h-20">
          Find Teammates
        </Button>
        <Button variant="outline" className="h-20">
          Beginner&apos;s Guide
        </Button>
      </div>

      {/* Upcoming Events */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your upcoming events will be displayed here.</p>
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
