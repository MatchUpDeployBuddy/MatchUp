"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FaUsers,
  FaCalendarAlt,
  FaRegClock,
  FaPencilAlt,
  FaTimes,
  FaCheck,
  FaMapMarkerAlt,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";
import { reverseGeocodeCoordinates } from "@/utils/geocoding";

interface EventDetails {
  id: string;
  creator_id: string;
  sport: string;
  participants_needed: number;
  skill_level: string;
  event_time: string;
  description: string;
  longitude: number;
  latitude: number;
  created_at: string;
  updated_at: string;
}

interface Buddy {
  joined_user_id: string;
  name: string;
}

interface Request {
  requester_id: string;
  user_name: string;
  message: string
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [participants, setParticipants] = useState<Buddy[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);

  const [editedDescription, setEditedDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchAllData(id as string);
  }, [id]);

  useEffect(() => {
    if (event && event.latitude && event.longitude) {
      fetchAddress(event.latitude, event.longitude);
    }
  }, [event]);

  async function fetchAddress(latitude: number, longitude: number) {
    try {
      const address = await reverseGeocodeCoordinates(latitude, longitude);
      setLocationAddress(address);
    } catch (error) {
      console.error("Failed to fetch address:", error);
      setLocationAddress(null);
    }
  }

  async function fetchAllData(eventId: string) {
    try {
      setIsLoading(true);

      // load all data in parallel
      const [eventRes, participantsRes, requestsRes] = await Promise.all([
        fetch(`/api/events/event-details?id=${eventId}`),
        fetch(`/api/event-participants?eventId=${eventId}`),
        fetch(`/api/events/requests?eventId=${eventId}`),
      ]);

      if (!eventRes.ok || !participantsRes.ok || !requestsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const eventData = await eventRes.json();
      const participantsData = await participantsRes.json();
      const requestsData = await requestsRes.json();

      setEvent(eventData.event);
      setEditedDescription(eventData.event?.description || "");
      setParticipants(participantsData?.participants || []);
      setRequests(requestsData?.pendingRequesters || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function doRequest(
    url: string,
    method: string,
    body?: Record<string, any>
  ) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "An unknown error occurred.");
    }
    return data;
  }

  async function handleSaveDescription() {
    if (!event || editedDescription === event.description) return;

    try {
      await doRequest("/api/update-match-description", "PUT", {
        id: event.id,
        description: editedDescription,
      });
      setEvent((prev) =>
        prev ? { ...prev, description: editedDescription } : null
      );
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving description:", err);
    }
  }

  async function handleCancelMatch(eventId: string) {
    try {
      const data = await doRequest("/api/events", "DELETE", { id: eventId });
      console.log(data.message);
      alert("Event deleted successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert(String(err));
    }
  }

  async function handleAcceptRequest(requesterId: string) {
    if (!event) return;

    try {
      const response = await doRequest("/api/event-request/accept", "PATCH", {
        requesterId,
        eventId: event.id,
      });
      const acceptedRequest = response.participant?.[0];
      if (!acceptedRequest) {
        throw new Error("Unexpected API response format");
      }

      const { requester_id, user_name } = acceptedRequest;

      setRequests((prev) =>
        prev.filter((req) => req.requester_id !== requesterId)
      );

      setParticipants((prev) => [
        ...prev,
        { joined_user_id: requester_id, name: user_name || "New Buddy" },
      ]);
    } catch (err) {
      console.error("Failed to accept request:", err);
      alert(String(err));
    }
  }

  async function handleRejectRequest(requesterId: string) {
    if (!event) return;

    try {
      await doRequest("/api/event-request/reject", "PATCH", {
        requesterId,
        eventId: event.id,
      });
      // remove request from list
      setRequests((prev) =>
        prev.filter((req) => req.requester_id !== requesterId)
      );
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert(String(err));
    }
  }


  async function handleRemoveParticipant(participantId: string) {
    if (!event) return;

    try {
      const data = await doRequest("/api/event-participants", "DELETE", {
        participantId,
        eventId: event.id,
      });

      console.log("Participant removed:", data.message);

      // Remove the participant from local state
      setParticipants((prev) =>
        prev.filter((buddy) => buddy.joined_user_id !== participantId)
      );
    } catch (err) {
      console.error("Failed to remove participant:", err);
      alert(String(err));
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-EN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString("en-EN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (isLoading) {
    return <p>Loading event details...</p>;
  }

  if (!event) {
    return <p>No event found.</p>;
  }

  const formattedDate = formatDate(event.event_time);
  const formattedTime = formatTime(event.event_time);

  return (
    <div className="container mx-auto p-6">
      <Button onClick={() => router.push("/dashboard")} className="mb-4">
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Details for: {event.sport}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Datum */}
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="h-5 w-5" />
            <span>{formattedDate}</span>
          </div>

          {/* Uhrzeit */}
          <div className="flex items-center gap-2">
            <FaRegClock className="h-5 w-5" />
            <span>{formattedTime}</span>
          </div>

          {/* Teilnehmeranzahl */}
          <div className="flex items-center gap-2">
            <FaUsers className="h-5 w-5" />
            <span>{event.participants_needed}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="h-5 w-5" />
            <span>
              {locationAddress
                ? locationAddress
                : `Latitude: ${event.latitude.toFixed(6)}, Longitude: ${event.longitude.toFixed(6)}`}
            </span>
          </div>

          {/* Creator */}
          {event.creator_id && participants.length > 0 && (
            <div className="flex items-center gap-2">
              <FaUserCircle className="h-5 w-5" />
              <span>
                {participants.find(
                  (participant) => participant.joined_user_id === event.creator_id
                )?.name || "Unknown Creator"}
              </span>
            </div>
          )}

          {/* Beschreibung */}
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

          {/* Teilnehmer */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              Buddys ({participants.length}/{event.participants_needed})
            </h3>
            <div className="space-y-2">
              {participants.map((buddy) => (
                <div
                  key={buddy.joined_user_id}
                  className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                >
                  <span>{buddy.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveParticipant(buddy.joined_user_id)}
                  >
                    <FaTimes className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Requests */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Requests ({requests.length})</h3>
            <div className="space-y-2">
              {requests.map((request) => (
                <div
                  key={request.requester_id}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md"
                >
                  <div>
                    <span className="font-medium">{request.user_name}</span>
                    <p className="text-sm text-gray-500">{request.message}</p>
                  </div>
                  <div className="flex gap-2">
                    {/* Annehmen */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleAcceptRequest(request.requester_id)}
                      disabled={participants.length >= event.participants_needed}
                    >
                      <FaCheck className="h-5 w-5" />
                    </Button>

                    {/* Ablehnen */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRejectRequest(request.requester_id)}
                    >
                      <FaTimes className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event stornieren */}
          <div className="text-center mt-6">
            <Button onClick={() => setShowCancelDialog(true)} className="mx-auto">
              Cancel Match
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog zum Bestätigen des Löschens */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 space-y-4 w-[400px]">
            <h3 className="text-lg font-semibold">Cancel Match</h3>
            <p>
              Are you sure you want to cancel this match? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                No, go back
              </Button>
              <Button onClick={() => handleCancelMatch(event.id)}>
                Yes, cancel it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
