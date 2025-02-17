"use client";

import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { reverseGeocodeCoordinates } from "@/utils/geocoding";
import { Input } from "@/components/ui/input";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface AddressSearchProps {
  value: string;
  onChange: (newAddress: string) => void;
}

interface Suggestion {
  place_name: string;
  center: [number, number];
}

export default function AddressSearch({ value, onChange }: AddressSearchProps) {
  const [internalQuery, setInternalQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.993682, 53.551086]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    setInternalQuery(value || "");
  }, [value]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([longitude, latitude]);
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
        {
          enableHighAccuracy: true
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: mapCenter,
      zoom: 9,
    });
    mapRef.current = map;

    const marker = new mapboxgl.Marker({})
      .setLngLat(mapCenter)
      .addTo(map);

    markerRef.current = marker;

    const handleMove = () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      const newCenter: [number, number] = [center.lng, center.lat];
      setMapCenter(newCenter);
      marker.setLngLat([center.lng, center.lat]);
      //markerRef.current?.setLngLat(newCenter);
    };

    const handleMoveEnd = async () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();

      const placeName = await reverseGeocodeCoordinates(center.lat, center.lng);
      if (placeName) {
        setInternalQuery(placeName);
        onChange(placeName);
      } else {
        setInternalQuery("No address found");
        onChange("No address found");
      }
    };

    map.on("move", handleMove);
    map.on("moveend", handleMoveEnd);

    return () => {
      map.off("move", handleMove);
      map.off("moveend", handleMoveEnd);
      map.remove(); // remove mapbox instance completely
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInternalQuery(query);
    onChange(query);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`
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

  const handleSelectSuggestion = (sug: Suggestion) => {
    setInternalQuery(sug.place_name);
    onChange(sug.place_name);
    setSuggestions([]);

    if (mapRef.current) {
      mapRef.current.flyTo({ center: sug.center, zoom: 14 });
    }
  };

  return (
    <div>
      <Input
        value={internalQuery}
        onChange={handleInputChange}
        placeholder="Enter an address"
        className="border-secondary text-md rounded-full"
      />

      {suggestions.length > 0 && (
        <ul className="border mt-2 rounded shadow">
          {suggestions.map((sug, idx) => (
            <li
              key={idx}
              onClick={() => handleSelectSuggestion(sug)}
              className="p-2 cursor-pointer hover:bg-gray-200"
            >
              {sug.place_name}
            </li>
          ))}
        </ul>
      )}

      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "500px", marginTop: "1rem" }}
      />
    </div>
  );
}
