"use client";

import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function AddressSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    {
      place_name: string;
      center: [number, number];
    }[]
  >([]);

  // set start coordinates
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    9.993682, 53.551086,
  ]);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // try to fetch user location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCenter: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        setMapCenter(userCenter);

        if (mapRef.current) {
          mapRef.current.flyTo({ center: userCenter, zoom: 14 });
        }
      },
      (error) => {
        console.log("Geolocation verweigert oder fehlgeschlagen:", error);
      }
    );
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: mapCenter,
      zoom: 9,
    });
    mapRef.current = map;

    const marker = new mapboxgl.Marker({
      anchor: "center",
    })
      .setLngLat(mapCenter)
      .addTo(map);

    markerRef.current = marker;

    const handleMove = () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      const newCenter: [number, number] = [center.lng, center.lat];
      setMapCenter(newCenter);

      markerRef.current?.setLngLat(newCenter);
    };

    const handleMoveEnd = async () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${center.lng},${center.lat}.json?access_token=${mapboxgl.accessToken}&limit=1`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch address from coordinates");
        }

        const data = await response.json();
        const placeName =
          data.features?.[0]?.place_name || "Keine Adresse gefunden";
        setSearchQuery(placeName);
      } catch (error) {
        console.error("Error in reverse geocoding:", error);
      }
    };

    map.on("move", handleMove);
    map.on("moveend", handleMoveEnd);

    return () => {
      map.off("move", handleMove);
      map.off("moveend", handleMoveEnd);
    };
  }, []);

  const handleSelectSuggestion = (suggestion: {
    place_name: string;
    center: [number, number];
  }) => {
    setSearchQuery(suggestion.place_name);
    setSuggestions([]);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: suggestion.center,
        zoom: 14,
        essential: true,
      });
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&autocomplete=true&limit=5`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Address Search</h1>

      <Input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Enter an address"
        className="border p-2 w-full rounded"
      />
     <Select>
        <SelectTrigger className="border-secondary text-md rounded-full">
          <SelectValue placeholder="Suggestions" />
        </SelectTrigger>
        <SelectContent>
          {suggestions.map((suggestion, index) => (
            <SelectItem
              key={index}
              value={suggestion.place_name}
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion.place_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-4">
        <p>
          <strong>Map Center (lat, lng):</strong> {mapCenter[1]}, {mapCenter[0]}
        </p>
      </div>

      <div
        ref={mapContainer}
        style={{ width: "100%", height: "500px", marginTop: "1rem" }}
      />
    </div>
  );
}
