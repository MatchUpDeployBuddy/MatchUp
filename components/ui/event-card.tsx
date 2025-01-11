import {
  FaCalendarAlt,
  FaRegClock,
  FaAngleRight,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  id: string;
  sport: string;
  event_time: string;
  imageUrl?: string;
  location?: string;
  participants_needed?: number;
  creator_id?: string;
  currentUserId?: string;
}

export function EventCard({
  id,
  sport,
  event_time,
  imageUrl,
  location,
  participants_needed,
  creator_id,
  currentUserId,
}: EventCardProps) {
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

  const isCreator = creator_id && currentUserId && creator_id === currentUserId;
  const showAdditionalInfo = location && participants_needed !== undefined;

  console.log(
    "EventCardProps",
    location,
  );

  return (
    <Card className="overflow-hidden bg-white p-4">
      <div className="flex items-center bg-white transition-colors">
        {/* Image */}
        <div
          className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 mr-4"
          style={{
            backgroundImage: `url(${imageUrl || "/placeholder.svg"})`,
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
              <FaCalendarAlt className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaRegClock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formattedTime}</span>
            </div>
            {showAdditionalInfo && (
              <>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {participants_needed} participants needed
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <Link href={`/match/${id}`} className="ml-4">
          <Button variant="outline" size="sm">
            {isCreator !== undefined
              ? isCreator
                ? "View Details"
                : "Request Join"
              : "View Details"}
            <FaAngleRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
