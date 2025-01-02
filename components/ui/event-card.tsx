import { FaCalendarAlt, FaRegClock, FaAngleRight } from "react-icons/fa"
import { Card } from "@/components/ui/card"
//import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EventCardProps {
  id: string
  sport: string
  event_time: string
  // location: string
  // status: "Own" | "Joined"
  // participants: number
  // imageUrl: string
}

export function EventCard({
  id, 
  sport,
  event_time,
  // location,
  // status,
  // participants,
  // imageUrl,
}: EventCardProps) {
  const date = new Date(event_time)
  const formattedDate = date.toLocaleDateString('en-EN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
  const formattedTime = date.toLocaleTimeString('en-EN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center p-4 bg-white hover:bg-gray-50 transition-colors">
        {/* <div className="relative h-24 w-24 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={sport}
            fill
            className="object-cover"
          />
        </div> */}
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{sport}</h3>
            {/* <div className={`px-3 py-1 rounded-full text-sm ${
              status === "Own" 
                ? "bg-[rgb(137,198,109)] text-white" 
                : "bg-gray-900 text-white"
            }`}>
              {status}
            </div> */}
          </div>
          
          <div className="space-y-1">
            {/* <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{location}</span>
            </div> */}
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="h-4 w-4" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaRegClock className="h-4 w-4" />
              <span className="text-sm">{formattedTime}</span>
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
  )
}

