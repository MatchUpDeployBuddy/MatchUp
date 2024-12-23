"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCamera,
} from "react-icons/fa";
import {
  GiSoccerBall,
  GiBasketballBall,
  GiTennisRacket,
  GiVolleyballBall,
  GiRunningShoe,
  GiMountainClimbing,
} from "react-icons/gi";
import { GrSwim } from "react-icons/gr";
import { IoMdBicycle } from "react-icons/io";
import { FaTableTennis } from "react-icons/fa";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const accountSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be 50 characters or less" }),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format",
  }),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    required_error: "Please select a gender",
  }),
  sportInterests: z
    .array(z.string())
    .min(1, { message: "Please select at least one sport" }),
  city: z.string().min(1, { message: "Please select a city" }),
  profilePicture: z
    .string()
    .url({ message: "Please upload a profile picture" })
    .optional(),
});

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

const germanCities = [
  "Berlin",
  "Hamburg",
  "Munich",
  "Cologne",
  "Frankfurt",
  "Stuttgart",
  "Düsseldorf",
  "Leipzig",
  "Dortmund",
  "Essen",
];

const sportIcons = {
  Soccer: GiSoccerBall,
  Basketball: GiBasketballBall,
  Tennis: GiTennisRacket,
  Volleyball: GiVolleyballBall,
  Swimming: GrSwim,
  Cycling: IoMdBicycle,
  Running: GiRunningShoe,
  Badminton: GiTennisRacket,
  "Table Tennis": FaTableTennis,
  Hiking: GiMountainClimbing,
};

export default function AccountCreationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      birthday: "",
      gender: undefined,
      sportInterests: [],
      city: "",
      profilePicture: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof accountSchema>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser(); // Wir holen uns den User aus dem Authentifizierungs-Context
      if (!user) {
        throw new Error("User not authenticated"); // TODO: in Zukungt in der middleware.ts einstellen das man nur mit account diese seite aufrufen kann
      }

      const userId = user.id;
      // TODO: Hier den POST request an die API machen wenn es die Tabelle in Supabase gibt
      // const response = await fetch("/api/account-creation", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ ...data, userId }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || "Failed to create account");
      // }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
    form.setValue("sportInterests", selectedSports);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-x p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-text-primary mb-8">
          {step === 1
            ? "Tell us about yourself"
            : step === 2
            ? "What are your interests?"
            : "Where are you located?"}
        </h1>
        <Progress value={(step / 3) * 100} className="mb-8" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Tell us about yourself */}
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaUser className="mr-2" />
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your Name"
                              {...field}
                              className="border-secondary text-md rounded-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaCalendarAlt className="mr-2" />
                            Birthday
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
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary text-lg">
                            Gender
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-row space-x-2 "
                            >
                              {["male", "female", "other"].map((gender) => (
                                <FormItem
                                  key={gender}
                                  className="flex items-center space-x-2 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem
                                      value={gender}
                                      className="text-primary border-secondary"
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-lg capitalize cursor-pointer">
                                    {gender.replace("-", " ")}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {/* What are your interests? */}
                {step === 2 && (
                  <FormField
                    control={form.control}
                    name="sportInterests"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-text-primary flex items-center text-xl mb-4">
                          Select your sport interests
                        </FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                          {sports.map((sport) => {
                            const SportIcon =
                              sportIcons[sport as keyof typeof sportIcons];
                            return (
                              <Card
                                key={sport}
                                className={`cursor-pointer transition-all duration-200 ${
                                  selectedSports.includes(sport)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background hover:bg-secondary/10"
                                }`}
                                onClick={() => toggleSport(sport)}
                              >
                                <CardContent className="flex flex-col items-center justify-center p-4 h-full">
                                  <SportIcon size={40} className="mb-2" />
                                  <span className="text-center">{sport}</span>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {/* Where are you located? */}
                {step === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaMapMarkerAlt className="mr-2" />
                            City
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-secondary text-lg  rounded-full">
                                <SelectValue placeholder="Select your city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {germanCities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profilePicture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaCamera className="mr-2" />
                            Profile Picture
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-24 h-24 border-2 border-primary">
                                <AvatarImage
                                  src={field.value}
                                  alt="Profile picture"
                                  className="object-cover w-full h-full"
                                />
                                <AvatarFallback className="bg-secondary text-secondary-foreground">
                                  Upload
                                </AvatarFallback>
                              </Avatar>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      field.onChange(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="border-secondary text-lg rounded-full cursor-pointer"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="border-secondary text-secondary-foreground hover:bg-secondary/10 text-lg px-6 py-3 rounded-full"
                >
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-6 py-3 rounded-full"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-6 py-3 rounded-full"
                >
                  Create Profile
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
