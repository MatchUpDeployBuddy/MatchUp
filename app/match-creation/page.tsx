"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TimeDropdown } from "@/components/ui/time-dropwdown";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FaCalendarAlt,
  FaUsers,
  FaFootballBall,
  FaRegClock,
} from "react-icons/fa";
import { FiBarChart } from "react-icons/fi";
import { IoMdInformationCircleOutline } from "react-icons/io";

import AddressSearch from "@/components/adress";
import { geocodeAddress, Coordinates } from "@/utils/geocoding";
import { useUserStore } from "@/store/userStore";

const supabase = await createClient();

const matchSchema = z.object({
  sport: z.string().min(1, { message: "Please select a sport" }),
  skillLevel: z.string().min(1, { message: "Please select a skill level" }),
  date: z.string().min(1, { message: "Please select a date" }),
  startTime: z.string().min(1, { message: "Please select a start time" }),
  buddies: z
    .number({ invalid_type_error: "Please select at least one buddy" })
    .min(1, { message: "Please select at least one buddy" }),
  description: z.string().min(1).max(200, {
    message: "Description cannot be empty",
  }),
  location: z.string().min(1, { message: "Please select a location" }),
});

// Sportarten (Dropdown)
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

// Skill (Dropdown)
const skill = ["Beginner", "Amateur", "Medium", "Expert", "Irrelevant"];

export default function MatchCreationPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); 
  const user = useUserStore((state) => state.user)
  // Formular-Hook
  const form = useForm<z.infer<typeof matchSchema>>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      sport: "",
      skillLevel: "",
      date: "",
      startTime: "",
      buddies: 1,
      description: "",
      location: "", 
    },
  });

  const onSubmit = async (data: z.infer<typeof matchSchema>) => {
    try {

      // Combine date and start time into an event timestamp
      const event_time = new Date(`${data.date}T${data.startTime}`).toISOString();
  
      // Geocoding of the address
      const coordinates: Coordinates | null = await geocodeAddress(data.location);
      
      if (!coordinates) {
        form.setError("location", {
          type: "custom",
          message: "Ungültige Adresse",
        });
        return;
      }
      const { latitude, longitude } = coordinates;
      const locationPoint = `SRID=4326;POINT(${longitude} ${latitude})`;


      // data for insert
      const eventData = {
        sport: data.sport,
        participants_needed: data.buddies,
        skill_level: data.skillLevel,
        event_time,
        description: data.description,
        creator_id: user?.id,
        location: locationPoint, 
      };

      const { error } = await supabase.from("events").insert([eventData]);
      if (error) {
        throw new Error(error.message);
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating match:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-x p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-text-primary mb-8">
          Create your own MATCH
        </h1>

        {/* Fehleranzeige */}
        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>An error has occurred. Please try again later.s</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-8">
              {/* Sport */}
              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary flex items-center text-lg">
                      <FaFootballBall className="mr-2" />
                      Sport
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-secondary text-md rounded-full">
                            <SelectValue placeholder="Select your sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sports.map((sport) => (
                            <SelectItem key={sport} value={sport}>
                              {sport}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Skill level */}
              <FormField
                control={form.control}
                name="skillLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary flex items-center text-lg">
                      <FiBarChart className="mr-2" />
                      Skill Level
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-secondary text-md rounded-full">
                            <SelectValue placeholder="Choose the required skill level for your match" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {skill.map((sk) => (
                            <SelectItem key={sk} value={sk}>
                              {sk}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex-1 relative">
                      <FormLabel className="text-text-primary flex items-center text-lg">
                        <FaCalendarAlt className="mr-2" />
                        Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          id="date"
                          value={selectedDate}
                          onChange={(e) => {
                            const selected = e.target.value;
                            setSelectedDate(selected);
                            field.onChange(selected);
                          }}
                          min={new Date().toISOString().split("T")[0]} // heutige oder zukünftige
                          className="border-secondary text-md rounded-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Time */}
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-text-primary flex items-center text-lg">
                        <FaRegClock className="mr-2" />
                        Time
                      </FormLabel>
                      <FormControl>
                        <TimeDropdown
                          minTime={new Date().toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          selectedDate={selectedDate}
                          onChange={(time: string) => field.onChange(time)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Number of Buddies */}
              <FormField
                control={form.control}
                name="buddies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary flex items-center text-lg">
                      <FaUsers className="mr-2" />
                      Buddies
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={
                          field.value === undefined || isNaN(field.value)
                            ? ""
                            : field.value
                        } // Leeres Feld zulassen
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        className="border-secondary text-md rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary flex items-center text-lg">
                      <IoMdInformationCircleOutline className="mr-2" />
                      Match Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        maxLength={100}
                        {...field}
                        placeholder="Write a descriptive text about your match in up to 100 characters"
                        className="border-secondary text-md rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location via AddressSearch */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary flex items-center text-lg">
                      Location
                    </FormLabel>
                    <FormControl>
                      <AddressSearch value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between mt-8">
              <Button
                type="submit"
                className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-6 py-3 rounded-full"
              >
                Create Match
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
