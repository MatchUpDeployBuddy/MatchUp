"use client";

import { useParams, useRouter } from "next/navigation"; 
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaUsers, FaCalendarAlt, FaRegClock, FaPencilAlt, FaTimes, FaCheck } from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea";

interface EventDetails {
  id: string;
  sport: string;
  event_time: string;
  participants_needed: number;
  description: string;
  location?: string;
}

interface Buddy {
  id: string;
  name: string;
}

interface Request {
  id: string;
  name: string;
  message: string;
}

export default function EventDetailsPage() {
  const { id } = useParams(); 
  const router = useRouter();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false); // State für das Dialogfeld

  // Dummy data for Buddys and Requests
  const dummyBuddys: Buddy[] = [
    { id: "b1", name: "Jannik Schneider" },
    { id: "b2", name: "Yassine Charm" },
  ];

  const dummyRequests: Request[] = [
    { id: "r1", name: "Kathalena Remz", message: "Hi, I would love to join!" },
    { id: "r2", name: "Ems Kretsch", message: "Are we focusing on core too?" },
  ];

  useEffect(() => {
    async function fetchEventDetails() {
      if (!id) return; 
      setLoading(true);
      try {
        const res = await fetch(`/api/get-match-details?id=${id}`);
        const data: EventDetails = await res.json();
        setEvent(data);
        setEditedDescription(data.description || "");
      } catch (err) {
        console.error("Failed to fetch event details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEventDetails();
  }, [id]);

  const handleSaveDescription = async () => {
    if (!event || editedDescription === event.description) return; 

    try {
      const res = await fetch(`/api/update-match-description`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: event.id,
          description: editedDescription,
        }),
      });

      if (res.ok) {
        setEvent((prevEvent) => prevEvent ? { ...prevEvent, description: editedDescription } : null);
        setIsEditing(false);
      } else {
        console.error("Failed to save description");
      }
    } catch (err) {
      console.error("Error saving description:", err);
    }
  };

  const handleConfirmCancelMatch = async (eventId: string, router: any) => {
    try {
      const res = await fetch(`/api/cancel-match`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: eventId }),
      });
  
      if (res.ok) {
        const data = await res.json();
        console.log(data.message); 
        alert("Event deleted successfully!");
  
        router.push("/dashboard");
      } else {
        const error = await res.json();
        console.error("Error deleting event:", error);
        alert(error.error || "Failed to delete the event.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
    }
  };
  

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (!event) {
    return <p>No event found.</p>;
  }

  const formattedDate = new Date(event.event_time).toLocaleDateString("en-EN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedTime = new Date(event.event_time).toLocaleTimeString("en-EN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="container mx-auto p-6">
      <Button onClick={() => router.push('/dashboard')} className="mb-4">
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Details for: {event.sport}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="h-5 w-5" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaRegClock className="h-5 w-5" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="h-5 w-5" />
            <span>{event.participants_needed}</span>
          </div>

          {/* Event Description Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Event Description</h3>
            <div className="relative">
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="min-h-[100px] p-4 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false); 
                        setEditedDescription(event.description || ""); 
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveDescription}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="p-4 rounded-md border border-gray-300 min-h-[100px]">
                    {event.description} 
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditing(true)} 
                  >
                    <FaPencilAlt className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

           {/* Buddys Section */}
           <div className="space-y-2">
            <h3 className="text-lg font-medium">Buddys ({dummyBuddys.length}/{event.participants_needed})</h3>
            <div className="space-y-2">
              {dummyBuddys.map((buddy) => (
                <div key={buddy.id} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                  <span>{buddy.name}</span>
                  <Button size="icon" variant="ghost"> 
                      <FaTimes className="h-5 w-5" /> 
                    </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Requests Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Requests ({dummyRequests.length})</h3>
            <div className="space-y-2">
              {dummyRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md">
                  <div>
                    <span className="font-medium">{request.name}</span>
                    <p className="text-sm text-gray-500">{request.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost">
                      <FaTimes className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <FaCheck className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel Match Button */}
          <div className="text-center mt-6">
            <Button onClick={() => setShowCancelDialog(true)} className="mx-auto">
              Cancel Match
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Modal */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 space-y-4 w-[400px]">
            <h3 className="text-lg font-semibold">Cancel Match</h3>
            <p>Are you sure you want to cancel this match? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                No, go back
              </Button>
              <Button onClick={() => handleConfirmCancelMatch(event.id, router)}>Yes, cancel it</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
