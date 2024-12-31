"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimeDropdownProps = {
  value?: string;
  onChange?: (value: string) => void;
  minTime?: string; // Minimale Zeit im Format "HH:mm"
  selectedDate?: string; // Das ausgewählte Datum im Format "YYYY-MM-DD"
};

export const TimeDropdown: React.FC<TimeDropdownProps> = ({
  onChange,
  minTime,
  selectedDate,
}) => {
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [validHours, setValidHours] = useState<number[]>([]);
  const [validMinutes, setValidMinutes] = useState<number[]>([0, 15, 30, 45]);

  // Berechne die minimal zulässige Zeit basierend auf dem heutigen Tag
  useEffect(() => {
    const now = new Date();
    const currentDateString = now.toISOString().split("T")[0]; // Heute im Format "YYYY-MM-DD"
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const isToday = selectedDate === currentDateString; // Überprüfen, ob das ausgewählte Datum heute ist

    const [minHour, minMinute] = isToday
      ? minTime
        ? minTime.split(":").map(Number)
        : [currentHour, currentMinute]
      : [0, 0]; // Keine Einschränkung für zukünftige Tage

    // Stunden und Minuten berechnen
    const allowedHours = Array.from({ length: 24 }, (_, i) => i).filter(
      (hour) => hour >= minHour
    );

    const allowedMinutes =
      isToday && hours === String(minHour)
        ? [0, 15, 30, 45].filter((minute) => minute >= minMinute)
        : [0, 15, 30, 45];

    setValidHours(allowedHours);
    setValidMinutes(allowedMinutes);
  }, [hours, minTime, selectedDate]);

  // Aktualisiere die Auswahl, wenn Stunden oder Minuten geändert werden
  useEffect(() => {
    if (hours && minutes) {
      const selectedTime = `${hours}:${minutes}`;
      onChange?.(selectedTime);
    }
  }, [hours, minutes, onChange]);

  return (
    <div className="space-y-2 w-full">
      <div className="flex w-full gap-2">
        <Select onValueChange={(value) => setHours(value)}>
          <SelectTrigger className="border-secondary text-md rounded-full">
            <SelectValue placeholder="Stunde" />
          </SelectTrigger>
          <SelectContent>
            {validHours.map((hour) => (
              <SelectItem key={hour} value={hour.toString().padStart(2, "0")}>
                {hour.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setMinutes(value)}>
          <SelectTrigger className="border-secondary text-md rounded-full">
            <SelectValue placeholder="Minute" />
          </SelectTrigger>
          <SelectContent>
            {validMinutes.map((minute) => (
              <SelectItem key={minute} value={minute.toString().padStart(2, "0")}>
                {minute.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
