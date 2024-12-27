"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type EventData = {
    id: string;
    sport: string;
    participants_needed: number;
    skill_level: string;
    event_time: string;
    description: string;
    longitude: number;
    latitude: number;  
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false); 

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events", {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Failed to load event data: ${res.status}`);
        }
        const data: EventData[] = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to catch the events:", error);
      }
    }

    fetchEvents();

    if (mapContainerRef.current && !mapRef.current) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current as HTMLElement,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-73.935242, 40.73061], // Beispielkoordinaten
        zoom: 12,
      });

      mapRef.current.on('load', () => {
        setMapLoaded(true);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove(); 
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && mapLoaded) { // Check if map is loaded
      events.forEach((event) => {
        try {
          new mapboxgl.Marker()
            .setLngLat([event.longitude, event.latitude])
            .setPopup(
              new mapboxgl.Popup().setHTML(`
                <h3>${event.sport}</h3>
                <p>${event.description}</p>
                <p>Skill Level: ${event.skill_level}</p>
                <p>Participants Needed: ${event.participants_needed}</p>
                <p>Event Time: ${new Date(event.event_time).toLocaleString()}</p>
              `)
            )
            .addTo(mapRef.current!);
        } catch (error) {
          console.error(`Error when adding the marker for event ${event.id}:`, error);
        }
      });
    }
  }, [events, mapLoaded]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sport Events Map</h1>
      <div
        ref={mapContainerRef}
        style={{ height: "500px", width: "100%" }}
        className="map-container"
      />
    </div>
  );
}