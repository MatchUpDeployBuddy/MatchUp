"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaFootballBall } from "react-icons/fa";

// Initialisierung von Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Zod-Schema zur Validierung des Formulars
const matchSchema = z.object({
  sport: z.string().min(1, { message: "Please select a sport" }),
  //location: z.string().min(1, { message: "Please enter a location" }),
  date: z.string().min(1, { message: "Please select a date" }),
  startTime: z.string().min(1, { message: "Please select a start time" }),
  buddies: z.number().min(1, { message: "Please select at least one buddy" }),
  description: z.string().min(1).max(200, { message: "Description cannot be longer than 200 characters" }),
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

export default function MatchCreationPage() {
  const router = useRouter();

  // Formular-Hook
  const form = useForm<z.infer<typeof matchSchema>>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      sport: "",
      //location: "",
      date: "",
      startTime: "",
      buddies: 1,
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof matchSchema>) => {
    try {
      // Kombinieren von Datum und Startzeit in ein Ereigniszeitstempel
      const event_time = new Date(`${data.date}T${data.startTime}`).toISOString();

      /* // Abrufen des Benutzers aus dem Authentifizierungs-Context
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error("Failed to get user: " + userError.message);
      }

      if (!user) {
        throw new Error("User not authenticated");
      }

      const creator_id = user.id;
      console.log("hallo user:", creator_id) */

      // Daten, die an die Backend-API gesendet werden
      const eventData = {
        sport: data.sport,
        //location: data.location,
        participants_needed: data.buddies, // Teilnehmeranzahl
        skill_level: "Beginner", // Beispielwert, später anpassbar
        event_time,
        description: data.description,
        //creator_id,
      };

      console.log("Event Daten:", eventData)

      // Event-Daten in die Datenbank einfügen
      const { data: event, error } = await supabase.from("events").insert([eventData]);

      if (error) {
        throw new Error(error.message);
      }

      // Weiterleitung zum Dashboard oder einer Erfolgsseite
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating match:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-x p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-text-primary mb-8">
          Create a New Sport Match
        </h1>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-secondary text-lg rounded-full">
                            <SelectValue placeholder="Select a sport" />
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

              {/* Location */}
              {/* <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary flex items-center text-lg">
                      <FaMapMarkerAlt className="mr-2" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the location"
                        {...field}
                        className="border-secondary text-md rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              
              {/* Date */}
              <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaCalendarAlt className="mr-2" />
                            Date
                        </FormLabel>
                        <FormControl>
                            <Input
                            type="date"
                            {...field}
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
                  <FormItem>
                    <FormLabel className="text-text-primary flex items-center text-lg">
                      <FaCalendarAlt className="mr-2" />
                      Start Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="border-secondary text-md rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Number of Buddies */}
              <FormField
                control={form.control}
                name="buddies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-primary flex items-center text-lg">
                      <FaUsers className="mr-2" />
                      Number of Buddies
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
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
                      Match Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter a description (max 200 characters)"
                        className="border-secondary text-md rounded-full"
                      />
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
