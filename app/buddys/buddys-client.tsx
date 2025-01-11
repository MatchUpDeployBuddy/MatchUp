"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/event-card";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaFilter } from "react-icons/fa";
import { FilterContent } from "./filter-content";
import { getSportImage } from "@/utils/supabase/match-images";
import { reverseGeocodeCoordinates } from "@/utils/geocoding";

interface Event {
  id: string;
  sport: string;
  event_time: string;
  skill_level: string;
  description: string;
  location: string;
  participants_needed: number;
  creator_id: string;
}

export default function BuddysClient() {
  const user = useUserStore((state) => state.user);
  const [events, setEvents] = useState<Event[]>([]);
  const [sportImages, setSportImages] = useState<Record<string, string>>({});
  const [userLocation, setUserLocation] = useState<string>("");
  const [userCoordinates, setUserCoordinates] = useState<
    [number, number] | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userCoordinates) {
      fetchEvents(userCoordinates);
    }
  }, [userCoordinates]);

  useEffect(() => {
    async function fetchSportImages() {
      const images: Record<string, string> = {};

      for (const event of events) {
        try {
          images[event.sport] = await getSportImage(event.sport);
        } catch (error) {
          console.error(
            `Error fetching sport image for ${event.sport}:`,
            error
          );
          images[event.sport] = ""; // Handle error (empty or fallback image)
        }
      }

      setSportImages(images);
    }

    if (events.length > 0) {
      fetchSportImages();
    }
  }, [events]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoordinates([longitude, latitude]);
          const address = await reverseGeocodeCoordinates(latitude, longitude);
          if (address) {
            setUserLocation(address);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Fallback to default coordinates (Berlin)
          setUserCoordinates([13.405, 52.52]);
        }
      );
    } else {
      // Fallback to default coordinates (Berlin)
      setUserCoordinates([13.405, 52.52]);
    }
  };

  const fetchEvents = async (coordinates: [number, number]) => {
    const [longitude, latitude] = coordinates;
    const params = new URLSearchParams({
      longitude: String(longitude),
      latitude: String(latitude),
    });

    try {
      const response = await fetch(`/api/events/available?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleApplyFilters = async (filters: any) => {
    const params = new URLSearchParams({
      longitude: String(filters.mapCenter[0]),
      latitude: String(filters.mapCenter[1]),
      radius: (filters.radius * 1000).toString(), // Convert km to meters
      ...(filters.sports.length > 0 && { sports: filters.sports.join(",") }),
      ...(filters.skillLevels.length > 0 && {
        skill_levels: filters.skillLevels.join(","),
      }),
      required_slots: filters.requiredSlots.toString(),
      start_date: filters.startDate.toISOString(),
      end_date: filters.endDate.toISOString(),
    });

    try {
      const response = await fetch(`/api/events/available?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return "Good Morning 🔥";
    if (currentHour >= 12 && currentHour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">{getGreeting()}</h1>
            <p className="text-3xl font-bold">{user.name}</p>
            {userLocation && (
              <p className="text-sm text-gray-500">
                Your location: {userLocation}
              </p>
            )}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FaFilter />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[90vw] sm:h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Filter Events</DialogTitle>
              </DialogHeader>
              <FilterContent onApplyFilters={handleApplyFilters} />
            </DialogContent>
          </Dialog>
        </div>

        <h2 className="text-2xl font-bold mb-4">Available MATCHES</h2>
        <div className="space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                imageUrl={sportImages[event.sport]}
                currentUserId={user.id}
              />
            ))
          ) : (
            <p>No upcoming events found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
