"use client";

import { useUserStore } from "@/store/userStore";
import { EventCard } from "@/components/ui/event-card";
import { useState, useEffect } from "react";
import { getRandomImage, getSportImage } from "@/utils/supabase/match-images"; 
import { CreateEventCard } from "@/components/ui/create-event-card"; 
import { useEventStore } from "@/store/eventStore";


interface DashboardProps {
  userId: string;
}

export default function DashboardComponent({ userId }: DashboardProps) {
  const [randomImageUrl, setRandomImageUrl] = useState<string>(""); 
  const [sportImages, setSportImages] = useState<Record<string, string>>({});
  const user = useUserStore((state) => state.user);
  const events = useEventStore((state) => state.events);
  
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
    if (!events) return;
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 pb-24">
    <div className="flex-grow container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">{getGreeting()} 🔥</h1>
          <p className="text-3xl font-bold">{user.username}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Create your own MATCH</h2>
      {randomImageUrl ? (
        <CreateEventCard imageUrl={randomImageUrl} />
      ) : (
        <p>No random image found. Try again later.</p>
      )}

      {/* Active Matches */}
      <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Active MATCHES</h2>
      <div className="space-y-4">
        {events.length > 0 ? (
          events.filter((event) => new Date(event.event_time) > new Date()).map((event) => (
            <EventCard
              key={event.id}
              {...event}
              imageUrl={sportImages[event.sport]}
              isCreator={event.creator_id === userId} 
              dashboardView={true}
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
