"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { FaCalendarAlt } from "react-icons/fa";
import AddressSearch from "@/components/adress";
import { geocodeAddress } from "@/utils/geocoding";

// 1) Import our new multi-select
import { MultiSelectDemo } from "@/components/ui/multi-select";

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
    startDate: "",
    endDate: "",
    location: "",
    mapCenter: [13.405, 52.52] as [number, number],
  });

  const isDisabled =
    filters.sports.length === 0 ||
    filters.skillLevels.length === 0 ||
    !filters.location ||
    !filters.startDate ||
    !filters.endDate;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddressChange = async (newAddress: string) => {
    handleFilterChange("location", newAddress);
    if (newAddress.length >= 3) {
      const coords = await geocodeAddress(newAddress);
      if (coords) {
        handleFilterChange("mapCenter", [coords.longitude, coords.latitude]);
      }
    }
  };

  const handleApplyFilters = () => {
    if (isDisabled) return;
    onApplyFilters(filters);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-auto p-4 bg-white rounded-lg shadow">
      {/* LEFT COLUMN */}
      <div className="space-y-4">
        {/* Sports MultiSelect */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Sports</Label>
          <MultiSelectDemo
            placeholder="Select sports"
            options={sports.map((sport) => ({
              value: sport,
              label: sport,
            }))}
            value={filters.sports}
            onChange={(selectedSports) =>
              handleFilterChange("sports", selectedSports)
            }
          />
        </div>

        {/* Skill Levels MultiSelect */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Skill Levels
          </Label>
          <MultiSelectDemo
            placeholder="Select skill levels"
            options={skillLevels.map((lvl) => ({
              value: lvl,
              label: lvl,
            }))}
            value={filters.skillLevels}
            onChange={(selectedLevels) =>
              handleFilterChange("skillLevels", selectedLevels)
            }
          />
        </div>

        {/* Radius */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Radius: {filters.radius} km
          </Label>
          <Slider
            min={1}
            max={100}
            step={1}
            value={[filters.radius]}
            onValueChange={(val) => handleFilterChange("radius", val[0])}
            className="mt-2"
          />
        </div>

        {/* Required Slots */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Min. Remaining Slots
          </Label>
          <Input
            type="number"
            min={1}
            value={filters.requiredSlots}
            onChange={(e) =>
              handleFilterChange("requiredSlots", parseInt(e.target.value))
            }
            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-4">
        {/* Date Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <FaCalendarAlt className="mr-2" />
            Date Range
          </Label>
          <div className="flex space-x-2 mt-1">
            <div className="flex-1">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                min={
                  filters.startDate || new Date().toISOString().split("T")[0]
                }
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Location & AddressSearch */}
        <div className="space-y-4">
          <Label>Location</Label>
          <AddressSearch
            value={filters.location}
            onChange={handleAddressChange}
          />
        </div>
      </div>

      {/* APPLY FILTERS BUTTON */}
      <Button
        onClick={handleApplyFilters}
        className="col-span-full"
        disabled={isDisabled}
      >
        Apply Filters
      </Button>
    </div>
  );
}
