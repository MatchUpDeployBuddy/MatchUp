"use client";

import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TmpClientComponent from "../TmpClientComponent/TmpClientComponent";
import { logout } from "../logout/action";
import Link from "next/link";

export default function DashboardComponent() {
  const user = useUserStore((state) => state.user);
  console.log("dashboard user", user?.username);


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">MatchUp Dashboard</h1>

      <div className="flex justify-between items-center mb-6">
        <TmpClientComponent />
        <h2 className="text-3xl font-bold">Hello {user?.username}</h2>

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
