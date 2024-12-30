"use client";

import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

type AddressSearchProps = {
  // Das, was aktuell im Formularfeld 'location' steht
  value: string;
  // Methode, mit der du den 'location'-Wert im Formular aktualisieren kannst
  onChange: (address: string) => void;

  // Falls du zusätzlich Lat/Lng ins Formular speichern willst
  onCoordinatesChange?: (lat: number, lng: number) => void;
};

export default function AddressComponent({
  value,
  onChange,
  onCoordinatesChange,
}: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<{
    place_name: string;
    center: [number, number];
  }[]>([]);

  // Startkoordinaten z.B. Hamburg
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.993682, 53.551086]);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // 1) Beim Mounten → User-Standort abfragen
  useEffect(() => {
    if (!navigator.geolocation) return;

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

  // 2) Erstelle die Map nur einmal (Achtung Dependency Array!)
  useEffect(() => {
    // Map nur erstellen, wenn ein Container existiert und noch keine mapRef
    if (!mapContainer.current || mapRef.current) return;

    // Neue Map instance
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: mapCenter,
      zoom: 9,
      pitchWithRotate: false,
      dragRotate: false,
    });
    mapRef.current = map;

    // Marker in der Mitte
    const marker = new mapboxgl.Marker({ anchor: "center" })
      .setLngLat(mapCenter)
      .addTo(map);
    markerRef.current = marker;

    // Move-Handler
    const handleMove = () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      const newCenter: [number, number] = [center.lng, center.lat];
      // Marker aktualisieren
      setMapCenter(newCenter);
      markerRef.current?.setLngLat(newCenter);
    };

    // MoveEnd-Handler → Reverse Geocoding
    const handleMoveEnd = async () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${center.lng},${center.lat}.json?` +
            `access_token=${mapboxgl.accessToken}&limit=1`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch address from coordinates");
        }

        const data = await response.json();
        const placeName = data.features?.[0]?.place_name || "Keine Adresse gefunden";

        setSearchQuery(placeName);
        onChange(placeName);

        if (onCoordinatesChange) {
          onCoordinatesChange(center.lat, center.lng);
        }
      } catch (error) {
        console.error("Error in reverse geocoding:", error);
      }
    };

    // Eventlistener
    map.on("move", handleMove);
    map.on("moveend", handleMoveEnd);

    // Cleanup
    return () => {
      map.off("move", handleMove);
      map.off("moveend", handleMoveEnd);
    };
    // Wichtig: NICHT mapCenter in den Dependencies, sonst wird die Map neu erzeugt!
  }, [onChange, onCoordinatesChange]);

  // 3) Wenn User in das Eingabefeld tippt (Suggestion Search)
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
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

  // 4) Suggestion geklickt
  const handleSelectSuggestion = (suggestion: {
    place_name: string;
    center: [number, number];
  }) => {
    setSearchQuery(suggestion.place_name);
    onChange(suggestion.place_name);

    if (onCoordinatesChange) {
      onCoordinatesChange(suggestion.center[1], suggestion.center[0]);
    }

    setSuggestions([]);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: suggestion.center,
        zoom: 14,
        essential: true,
      });
    }
  };

  return (
    <div className="p-2">
      {/* Textfeld für die Adresse */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Enter an address"
        className="border p-2 w-full rounded"
      />

      {/* Vorschläge */}
      <ul className="border mt-2 rounded shadow">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            onClick={() => handleSelectSuggestion(suggestion)}
            className="p-2 cursor-pointer hover:bg-gray-200"
          >
            {suggestion.place_name}
          </li>
        ))}
      </ul>

      {/* Debug: Koordinaten etc. */}
      <div className="mt-4">
        <p>
          <strong>Map Center (lat, lng):</strong> {mapCenter[1]}, {mapCenter[0]}
        </p>
      </div>

      {/* Map-Container */}
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "400px", marginTop: "1rem" }}
      />
    </div>
  );
}
