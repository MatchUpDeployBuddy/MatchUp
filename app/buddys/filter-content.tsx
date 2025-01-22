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
import AddressSearch from "@/components/adress";
import { FaCalendarAlt } from "react-icons/fa";
import { geocodeAddress } from "@/utils/geocoding";

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
    if (isDisabled) return; // just a safety check
    onApplyFilters(filters);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-auto p-4 bg-white rounded-lg shadow">
      {/* LEFT COLUMN */}
      <div className="space-y-4">
        {/* Sports */}
        <div>
          <Label htmlFor="sports" className="text-sm font-medium text-gray-700">
            Sports
          </Label>
          <Select onValueChange={(value) => handleFilterChange("sports", [value])}>
            <SelectTrigger id="sports" className="w-full mt-1">
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
          <Label htmlFor="skillLevels" className="text-sm font-medium text-gray-700">
            Skill Level
          </Label>
          <Select
            onValueChange={(value) => handleFilterChange("skillLevels", [value])}
          >
            <SelectTrigger id="skillLevels" className="w-full mt-1">
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
          <Label className="text-sm font-medium text-gray-700">
            Radius: {filters.radius} km
          </Label>
          <Slider
            min={1}
            max={100}
            step={1}
            value={[filters.radius]}
            onValueChange={(value) => handleFilterChange("radius", value[0])}
            className="mt-2"
          />
        </div>

        {/* Required Slots */}
        <div>
          <Label
            htmlFor="requiredSlots"
            className="text-sm font-medium text-gray-700"
          >
            Min. Remaining Slots
          </Label>
          <Input
            id="requiredSlots"
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
              <Label htmlFor="startDate" className="sr-only">
                From
              </Label>
              <Input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate" className="sr-only">
                To
              </Label>
              <Input
                type="date"
                id="endDate"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                min={filters.startDate || new Date().toISOString().split("T")[0]}
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Location + AddressSearch */}
        <div className="space-y-4">
          <Label>Location</Label>
          <AddressSearch
            value={filters.location}
            onChange={handleAddressChange}
          />
        </div>
      </div>

      {/* APPLY FILTERS */}
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
