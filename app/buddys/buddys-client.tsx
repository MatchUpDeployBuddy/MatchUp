"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/event-card";
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
import { reverseGeocodeCoordinates, formatAddress } from "@/utils/geocoding";
import { Event } from "@/types";

export default function BuddysClient() {
  const user = useUserStore((state) => state.user);
  const [events, setEvents] = useState<Event[]>([]);
  const [sportImages, setSportImages] = useState<Record<string, string>>({});
  const [userLocation, setUserLocation] = useState<string>("Germany");
  const [userCoordinates, setUserCoordinates] = useState<[number, number]>([
    10.4515, 51.1657,
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    fetchEvents(userCoordinates);
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
          images[event.sport] = "";
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
            setUserLocation(formatAddress(address));
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  };

  const fetchEvents = async (coordinates: [number, number]) => {
    const [longitude, latitude] = coordinates;
    const params = new URLSearchParams({
      longitude: String(longitude),
      latitude: String(latitude),
      radius: "100000000",
    });

    try {
      const response = await fetch(`/api/events/available?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      console.log("Events:", data.events);
      setEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleApplyFilters = async (filters: any) => {
    const [lng, lat] = filters.mapCenter;
    const params = new URLSearchParams({
      longitude: String(lng),
      latitude: String(lat),
      radius: (filters.radius * 1000).toString(),
      required_slots: String(filters.requiredSlots),
      start_date: filters.startDate,
      end_date: filters.endDate,
    });

    // Append each selected sport as its own ?sports=...
    if (filters.sports && filters.sports.length > 0) {
      filters.sports.forEach((sport: string) => {
        params.append("sports", sport);
      });
    }

    // Append each selected skill level as its own ?skill_levels=...
    if (filters.skillLevels && filters.skillLevels.length > 0) {
      filters.skillLevels.forEach((lvl: string) => {
        params.append("skill_levels", lvl);
      });
    }

    try {
      const response = await fetch(
        `/api/events/available?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return "Good Morning 🔥";
    if (currentHour >= 12 && currentHour < 18) return "Good Afternoon 🔥";
    return "Good Evening 🔥";
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 pb-24">
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">{getGreeting()}</h1>
            <p className="text-3xl font-bold">{user.username}</p>

            {userLocation && (
              <p className="text-sm text-gray-500">
                Your location: {userLocation}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Filter Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            {/* Reset Filters Button */}
            <Button
              variant="outline"
              onClick={() => window.location.reload()} // Seite neu laden
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Available MATCHES</h2>
        <div className="space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                imageUrl={sportImages[event.sport]}
                isCreator={event.creator_id === user.id}
                dashboardView={false}
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
