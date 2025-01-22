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
  FaUserCircle,
  FaDumbbell,
} from "react-icons/fa";
import { reverseGeocodeCoordinates } from "@/utils/geocoding";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useUserStore } from "@/store/userStore";
import { useEventStore } from "@/store/eventStore";
import { Input } from "@/components/ui/input";

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
  event_name: string;
}

interface Buddy {
  joined_user_id: string;
  name: string;
  profile_picture_url: string;
}

interface Request {
  requester_id: string;
  user_name: string;
  message: string;
  profile_picture_url: string;
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const user = useUserStore((state) => state.user);
  const removeEvent = useEventStore((state) => state.removeEvent);
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [participants, setParticipants] = useState<Buddy[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // For user who is not in participants, we'll show "Request Join" button
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchAllData(id as string);
  }, [id]);

  useEffect(() => {
    if (event && event.latitude && event.longitude) {
      fetchAddress(event.latitude, event.longitude);
    }
  }, [event]);

  // Whenever participants changes, check if current user is a participant
  useEffect(() => {
    if (!user || !participants) {
      setHasJoined(false);
      return;
    }
    const isParticipant = participants.some(
      (p) => p.joined_user_id === user.id
    );
    setHasJoined(isParticipant);
  }, [participants, user]);

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
    if (!user || !requests) return;
    const userHasRequested = requests.some(
      (req) => req.requester_id === user.id
    );
    setHasPendingRequest(userHasRequested);
  }, [requests, user]);

  async function fetchAllData(eventId: string) {
    try {
      setIsLoading(true);
  
      const [eventRes, participantsRes, requestsRes] = await Promise.all([
        fetch(`/api/events/event-details?id=${eventId}`),
        fetch(`/api/event-participants?eventId=${eventId}`),
        fetch(`/api/event-request?eventId=${eventId}`),
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
  
      if (user) {
        const userHasRequested = requestsData.pendingRequesters.some(
          (req: { requester_id: string }) => req.requester_id === user.id
        );
        console.log("User has requested:", userHasRequested);
        setHasPendingRequest(userHasRequested);
      }
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

  // Save (edit) event description
  async function handleSaveDescription() {
    if (!event || editedDescription === event.description) return;

    try {
      await doRequest("/api/update-event-description", "PUT", {
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

  // Cancel the match (owner only)
  async function handleCancelEvent(eventId: string) {
    try {
      const data = await doRequest("/api/events", "DELETE", { id: eventId });
      console.log(data.message);
      removeEvent(eventId);
      toast.success("Event deleted successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Error canceling Event");
    }
  }

  // Accept request (owner only)
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

      const { requester_id, user_name, profile_picture_url } = acceptedRequest;

      // Remove from requests
      setRequests((prev) =>
        prev.filter((req) => req.requester_id !== requesterId)
      );

      // Add to participants
      setParticipants((prev) => [
        ...prev,
        {
          joined_user_id: requester_id,
          name: user_name || "New Buddy",
          profile_picture_url: profile_picture_url,
        },
      ]);
    } catch (err) {
      console.error("Failed to accept request:", err);
      toast.error("Failed to accept request");
    }
  }

  // Reject request (owner only)
  async function handleRejectRequest(requesterId: string) {
    if (!event) return;

    try {
      await doRequest("/api/event-request/reject", "PATCH", {
        requesterId,
        eventId: event.id,
      });
      // remove request from local state
      setRequests((prev) =>
        prev.filter((req) => req.requester_id !== requesterId)
      );
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error("Error rejecting request");
    }
  }

  // Remove participant (owner only)
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
      toast.error("Failed to remove participant");
    }
  }

  // For non-participants: "Request Join"
  async function handleRequestJoin() {
    if (!event || !user) return;

    const message =
      inputValue.trim() === ""
        ? "I would like to join this event!"
        : inputValue;
    setInputValue("");
    try {
      const body = {
        event_id: event.id,
        requester_id: user.id,
        message: message,
      };
      const data = await doRequest("/api/event-request", "POST", body);
      toast.info(data.message || "Request sent!");
      setHasPendingRequest(true);
      
    } catch (err: any) {
      if (
        err.message &&
        err.message.includes("Failed to insert request into the database")
      ) {
        toast.error("You have already sent a request to join the match.");
      } else {
        toast.error("Failed to send join request");
      }
    }
  }

  // For non-participants "Leave Event"
  async function handleLeave() {
    if (!event || !user) return;

    try {
      await doRequest("/api/event-participants", "DELETE", {
        participantId: user.id,
        eventId: event.id,
      });

      setParticipants((prev) =>
        prev.filter((buddy) => buddy.joined_user_id !== user.id)
      );
      removeEvent(event.id);
      setHasJoined(false);
      toast.success("You have left the event.");
    } catch (err) {
      console.error("Failed to leave the event:", err);
      toast.error("Failed to leave the event");
    }
  }  

  // Helper: format date/time
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
  const isOwner = user && user.id === event.creator_id;

  const formattedDate = formatDate(event.event_time);
  const formattedTime = formatTime(event.event_time);

  return (
    <div className="container mx-auto p-6">
      <Button onClick={() => router.push("/dashboard")} className="mb-4">
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Details for: {event.event_name} | {event.sport}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date */}
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="h-5 w-5" />
            <span>{formattedDate}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2">
            <FaRegClock className="h-5 w-5" />
            <span>{formattedTime}</span>
          </div>

          {/* Participants needed */}
          <div className="flex items-center gap-2">
            <FaUsers className="h-5 w-5" />
            <span>{event.participants_needed}</span>
          </div>

          {/* Skill level */}
          <div className="flex items-center gap-2">
            <FaDumbbell className="h-5 w-5" />
            <span>{event.skill_level}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="h-5 w-5" />
            <span>
              {locationAddress
                ? locationAddress
                : `Lat: ${event.latitude.toFixed(
                    6
                  )}, Lng: ${event.longitude.toFixed(6)}`}
            </span>
          </div>

          {/* Creator (show the name if found among participants) */}
          {event.creator_id && participants.length > 0 && (
            <div className="flex items-center gap-2">
              <FaUserCircle className="h-5 w-5" />
              <span>
                {participants.find(
                  (participant) =>
                    participant.joined_user_id === event.creator_id
                )?.name || "Unknown Creator"}
              </span>
            </div>
          )}

          {/* Description & Edit */}
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
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setIsEditing(true)}
                    >
                      <FaPencilAlt className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Participants List (owner can remove) */}
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
                  {/* Profile + Name */}
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 border-2 border-primary">
                      <AvatarImage
                        src={buddy.profile_picture_url}
                        alt={buddy.name}
                        className="object-cover w-full h-full"
                      />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {buddy.name ? buddy.name.charAt(0).toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{buddy.name}</span>
                  </div>

                  {/* Only the owner can remove participants */}
                  {isOwner && (
                      <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveParticipant(buddy.joined_user_id)}
                      disabled={buddy.joined_user_id === event.creator_id}
                    >
                      <FaTimes className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Show requests only if owner */}
          {isOwner && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Requests ({requests.length})
              </h3>
              <div className="space-y-2">
                {requests.map((request) => (
                  <div
                    key={request.requester_id}
                    className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md"
                  >
                    {/* Profile + Name + Message */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarImage
                          src={
                            request.profile_picture_url || "/default-avatar.png"
                          }
                          alt={request.user_name}
                          className="object-cover w-full h-full"
                        />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {request.user_name
                            ? request.user_name.charAt(0).toUpperCase()
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{request.user_name}</span>
                        <p className="text-sm text-gray-500">
                          {request.message}
                        </p>
                      </div>
                    </div>

                    {/* Accept / Reject Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleAcceptRequest(request.requester_id)
                        }
                        disabled={
                          participants.length >= event.participants_needed
                        }
                      >
                        <FaCheck className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleRejectRequest(request.requester_id)
                        }
                      >
                        <FaTimes className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show "Cancel Match" only if owner */}
          {isOwner ? (
            <div className="text-center mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">Cancel Match</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Match</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this match? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancelEvent(event.id)}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : !hasJoined ? (
            <div className="text-center mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                  className="mx-auto"
                  disabled={hasPendingRequest}>
                     {hasPendingRequest ? "Request Pending" : "Request Join"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Request Join</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please provide a message explaining why you&apos;d like to
                      join the event. This will help the organizer understand
                      your interest.
                    </AlertDialogDescription>
                    <Input
                      type="text"
                      placeholder="Hey, I would like to join your match!"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setInputValue("")}>
                      {" "}
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleRequestJoin}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="text-center mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">Leave Match</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave Match</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to leave this match? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLeave}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
