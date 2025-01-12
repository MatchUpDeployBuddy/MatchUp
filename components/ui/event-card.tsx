import { FaCalendarAlt, FaRegClock, FaAngleRight, FaMapMarkerAlt } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { reverseGeocodeCoordinates } from "@/utils/geocoding";

interface EventCardProps {
  id: string;
  sport: string;
  event_time: string;
  imageUrl?: string;
  isCreator: boolean;
  latitude: number;
  longitude: number;
  // status: "Own" | "Joined"
  // participants: number
  // imageUrl: string
}

export function EventCard({
  id,
  sport,
  event_time,
  imageUrl,
  isCreator,
  latitude,
  longitude
}:
EventCardProps) {
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const date = new Date(event_time);
  const formattedDate = date.toLocaleDateString("en-EN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedTime = date.toLocaleTimeString("en-EN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  async function fetchAddress(latitude: number, longitude: number) {
      try {
        const address = await reverseGeocodeCoordinates(latitude, longitude);
        setLocationAddress(address);
      } catch (error) {
        console.error("Failed to fetch address:", error);
        setLocationAddress(null);
      }
  }

  useEffect(() => {
      if (latitude && longitude) {
        fetchAddress(latitude, longitude);
      }
  }, [latitude, longitude]);
  
  if(!imageUrl) {
    return <div></div>
  }

  return (
    <Card className="overflow-hidden bg-white p-2 relative">
      <div
        className={`absolute top-2 right-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${
          isCreator
            ? "bg-green-100 text-green-700 border border-green-400"
            : "bg-gray-100 text-gray-700 border border-gray-400"
        }`}
      >
        {isCreator ? "Own" : "Joined"}
      </div>

      <div className="flex items-center bg-white transition-colors">
        <div
          className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 mr-4"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{sport}</h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="h-4 w-4" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaRegClock className="h-4 w-4" />
              <span className="text-sm">{formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="h-4 w-4" />
            <span className="text-sm">
              {locationAddress
                ? locationAddress
                : `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`}
            </span>
          </div>
          </div>
        </div>

        <Link href={`/match/${id}`}>
          <Button variant="ghost" size="sm" className="ml-4">
            View Details
            <FaAngleRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
