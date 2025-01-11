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
import AddressSearch from "@/components/adress";

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
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: "",
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-auto">
      <div className="space-y-4">
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

        <div>
          <Label>Date Range</Label>
          <Calendar
            mode="range"
            selected={{ from: filters.startDate, to: filters.endDate }}
            onSelect={(range) => {
              if (!range) return;
              const { from, to } = range;
              if (from) handleFilterChange("startDate", from);
              if (to) handleFilterChange("endDate", to);
              else if (from) handleFilterChange("endDate", from);
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Location</Label>
        <AddressSearch
          value={filters.location}
          onChange={(value) => handleFilterChange("location", value)}
        />
      </div>

      <Button onClick={handleApplyFilters} className="col-span-full">
        Apply Filters
      </Button>
    </div>
  );
}

