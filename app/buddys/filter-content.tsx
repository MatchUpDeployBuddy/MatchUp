"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";

import { geocodeAddress } from "@/utils/geocoding";
import AddressSearch from "@/components/adress"; // <--- Using the unmodified AddressSearch

// Arrays for sports & skillLevels
const sports = [
  "Soccer",
  "Basketball",
  "Tennis",
  "Volleyball",
  "Swimming",
  "Cycling",
  "Running",
  "Badminton",
  "Table Tennis",
  "Hiking",
];

const skillLevels = ["Beginner", "Amateur", "Medium", "Expert", "Irrelevant"];

interface FilterContentProps {
  onApplyFilters: (filters: any) => void;
}

export function FilterContent({ onApplyFilters }: FilterContentProps) {
  const [filters, setFilters] = useState({
    sports: [] as string[],
    skillLevels: [] as string[],
    radius: 10,
    requiredSlots: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default "to"
    location: "",
    mapCenter: [],
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Called on "Apply Filters"
  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  /**
   *  If the user types or picks a suggestion in AddressSearch, 
   *  we only get the address string from `onChange(newAddress)`.
   *  So we do a forward geocode to get lat/lng.
   */
  const handleAddressChange = async (newAddress: string) => {
    handleFilterChange("location", newAddress);

    if (newAddress.length > 0) {
      const coords = await geocodeAddress(newAddress);
      if (coords) {
        handleFilterChange("mapCenter", [coords.longitude, coords.latitude]);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-auto">
      {/* LEFT COLUMN: sports, skillLevels, radius, slots, date range */}
      <div className="space-y-4">
        {/* Sports */}
        <div>
          <Label htmlFor="sports">Sports</Label>
          <Select onValueChange={(value) => handleFilterChange("sports", [value])}>
            <SelectTrigger id="sports">
              <SelectValue placeholder="Select sports" />
            </SelectTrigger>
            <SelectContent>
              {sports.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skill Level */}
        <div>
          <Label htmlFor="skillLevels">Skill Level</Label>
          <Select onValueChange={(value) => handleFilterChange("skillLevels", [value])}>
            <SelectTrigger id="skillLevels">
              <SelectValue placeholder="Select skill level" />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Radius */}
        <div>
          <Label>Radius: {filters.radius} km</Label>
          <Slider
            min={1}
            max={100}
            step={1}
            value={[filters.radius]}
            onValueChange={(value) => handleFilterChange("radius", value[0])}
          />
        </div>

        {/* Required Slots */}
        <div>
          <Label htmlFor="requiredSlots">Required Slots</Label>
          <Input
            id="requiredSlots"
            type="number"
            min={1}
            value={filters.requiredSlots}
            onChange={(e) => handleFilterChange("requiredSlots", parseInt(e.target.value))}
            className="border-secondary text-md rounded-full"
          />
        </div>

        {/* Single Calendar for "Date Range" (from -> to) */}
        <div>
          <Label>Date Range</Label>
          <Calendar
            // Shadcn calendar can do a range in one widget
            mode="range"
            // We map state => { from: Date, to: Date }
            selected={{ from: filters.startDate, to: filters.endDate }}
            // When the user picks a new range:
            onSelect={(range) => {
              if (!range) return;
              const { from, to } = range;

              // Update state with the new from/to
              if (from) {
                handleFilterChange("startDate", from);
              }

              if (to) {
                handleFilterChange("endDate", to);
              } else if (from) {
                handleFilterChange("endDate", from);
              }
            }}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: AddressSearch map + input */}
      <div className="space-y-4">
        <Label>Location</Label>
        <AddressSearch
          value={filters.location}
          onChange={handleAddressChange}
        />
      </div>

      {/* Button */}
      <Button onClick={handleApplyFilters} className="col-span-full">
        Apply Filters
      </Button>
    </div>
  );
}
