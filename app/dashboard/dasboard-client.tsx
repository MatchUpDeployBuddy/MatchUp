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
import { getRandomImage, getSportImage } from "@/utils/supabase/match-images"; 
import { CreateMatchCard } from "@/components/ui/create-match-card"; 

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
  const [randomImageUrl, setRandomImageUrl] = useState<string>(""); // Set as empty string instead of null
  const [sportImages, setSportImages] = useState<Record<string, string>>({});
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

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

  // Get random match picture
  useEffect(() => {
    const fetchRandomImage = async () => {
      try {
        const imageUrl = await getRandomImage();
        setRandomImageUrl(imageUrl); // Update with valid URL or error
      } catch (error) {
        console.error("Error fetching random image:", error);
        setRandomImageUrl(""); // Or you can set an error state here
      }
    };

    fetchRandomImage();
  }, []);

  // Get specific match picture
  useEffect(() => {
    async function fetchSportImages() {
      const images: Record<string, string> = {};
  
      for (const event of events) {
        try {
          images[event.sport] = await getSportImage(event.sport);
        } catch (error) {
          console.error(`Error fetching sport image for ${event.sport}:`, error);
          images[event.sport] = ""; // Handle error (empty or fallback image)
        }
      }
  
      setSportImages(images);
    }
  
    if (events.length > 0) {
      fetchSportImages();
    }
  }, [events]);

  
  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return "Good Morning 🔥";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

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
    <div className="flex flex-col min-h-screen bg-gray-100">
    <div className="flex-grow container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">{getGreeting()} 🔥</h1>
          <p className="text-3xl font-bold">{user.name}</p>
        </div>
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Create your own MATCH</h2>
      {randomImageUrl ? (
        <CreateMatchCard imageUrl={randomImageUrl} />
      ) : (
        <p>No random image found. Try again later.</p>
      )}

      {/* Active Matches */}
      <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Active MATCHES</h2>
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              imageUrl={sportImages[event.sport]} 
            />
          ))
        ) : (
          <p>No upcoming events found.</p>
        )}
      </div>
    </div>
    </div>
  </div>
  );
}
