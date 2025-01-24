import {
  FaCalendarAlt,
  FaRegClock,
  FaAngleRight,
  FaMapMarkerAlt,
  FaUsers,
  FaDumbbell,
} from "react-icons/fa";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { reverseGeocodeCoordinates } from "@/utils/geocoding";

interface EventCardProps {
  id: string;
  sport: string;
  event_time: string;
  event_name?: string | null;
  imageUrl?: string;
  isCreator: boolean;
  latitude: number;
  longitude: number;
  available_slots?: number;
  participants_needed: number;
  dashboardView: boolean;
  skill_level: string;
}

export function EventCard({
  id,
  sport,
  event_time,
  event_name,
  imageUrl,
  isCreator,
  latitude,
  longitude,
  available_slots,
  dashboardView,
  participants_needed,
  skill_level,
}: EventCardProps) {
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

  if (!imageUrl) {
    return <div></div>;
  }

  return (
    <Card className="overflow-hidden bg-white p-4 relative">
      {dashboardView && (
        <>
          {/* Mobile version of the label */}
          <div className="block sm:hidden mb-2">
            <div
              className={`z-10 px-3 py-1.5 inline-block rounded-full text-xs font-semibold shadow-md border ${
                isCreator
                  ? "bg-green-100 text-green-700 border-green-400"
                  : "bg-gray-100 text-gray-700 border-gray-400"
              }`}
            >
              {isCreator ? "Own" : "Joined"}
            </div>
          </div>

          {/* Tablet/desktop version of the label */}
          <div
            className={`hidden sm:block z-10 absolute top-2 right-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border ${
              isCreator
                ? "bg-green-100 text-green-700 border-green-400"
                : "bg-gray-100 text-gray-700 border-gray-400"
            }`}
          >
            {isCreator ? "Own" : "Joined"}
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center bg-white transition-colors relative h-full">
        {/* Image container */}
        <div
          className="relative w-full sm:w-24 h-40 sm:h-24 rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-4 flex-shrink-0"
          style={{
            backgroundImage: `url(${imageUrl || "/placeholder.svg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Text container */}
        <div className="flex-1">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold">{`${
              event_name ? `${event_name} | ` : ""
            }${sport}`}</h3>

            <div className="flex items-center gap-2">
              <FaCalendarAlt className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaRegClock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {isCreator
                  ? `${participants_needed} ${
                      participants_needed === 1 ? "Buddy" : "Buddies"
                    }`
                  : available_slots !== undefined && available_slots !== null
                  ? available_slots === 0
                    ? "Match full"
                    : `${available_slots} ${
                        available_slots === 1 ? "Buddy" : "Buddies"
                      } needed`
                  : participants_needed !== undefined &&
                    participants_needed !== null
                  ? `${participants_needed} ${
                      participants_needed === 1 ? "Buddy" : "Buddies"
                    }`
                  : "Loading slots..."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaDumbbell className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{skill_level}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="h-4 w-4 text-gray-500 max-w-[calc(100%-1.5rem)]" />
              <span className="text-sm truncate max-w-full">
                {locationAddress ||
                  `Latitude: ${latitude.toFixed(
                    6
                  )}, Longitude: ${longitude.toFixed(6)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Button */}
        <Link href={`/event/${id}`} className="mt-4 sm:mt-0 sm:ml-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto mt-4 sm:mt-0 sm:absolute sm:right-4 sm:top-1/2 sm:transform sm:-translate-y-1/2"
          >
            {isCreator
              ? "View Details"
              : dashboardView
              ? "View Details"
              : "Request Join"}{" "}
            <FaAngleRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
