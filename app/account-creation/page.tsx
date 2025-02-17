"use client";
import { useState } from "react";
import { uploadProfilePicture } from "@/utils/supabase/storage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateAccount } from "./actions";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCamera,
  FaTableTennis,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { useUserStore } from "@/store/userStore";

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
  profilePicture: z.string().optional(),
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fetchUser = useUserStore((state) => state.fetchUser);

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      const allowedTypes = ["image/jpeg", "image/png"];

      if (file.size > MAX_SIZE) {
        setErrorMessage("The profile picture must be a maximum of 2MB.");
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Only JPEG and PNG images are allowed.");
        return;
      }

      setProfilePictureFile(file);
      setErrorMessage(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
    }
  };

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
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof accountSchema>) => {
    try {
      if (profilePictureFile) {
        setUploading(true);
        const uploadedUrl = await uploadProfilePicture(profilePictureFile);
        setUploading(false);

        if (uploadedUrl) {
          data.profilePicture = uploadedUrl;
        } else {
          throw new Error("Error uploading profile picture");
        }
      } else {
        data.profilePicture = "";
      }

      await updateAccount(data);
      await fetchUser();

      setSuccessMessage("Account created successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error creating account:", error);
      setErrorMessage(error.message || "Failed to create account");
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleSport = (sport: string) => {
    const newSelectedSports = selectedSports.includes(sport)
      ? selectedSports.filter((s) => s !== sport)
      : [...selectedSports, sport];

    setSelectedSports(newSelectedSports);
    form.setValue("sportInterests", newSelectedSports);
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-x -z-10" />
      <div className="relative max-w-4xl min-h-screen mx-auto p-8 bg-white shadow-lg">
        {successMessage && (
          <Alert variant="default" className="mb-4">
            <CheckCircledIcon className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <h1 className="text-4xl font-bold text-center text-text-primary mb-8">
          {step === 1
            ? "Tell us about yourself"
            : step === 2
            ? "What are your interests?"
            : "Where are you located?"}
        </h1>
        <Progress value={(step / 3) * 100} className="mb-8" />

        <Form {...form}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* =========== STEP 1: Basic Info =========== */}
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-primary flex items-center text-lg">
                          <FaUser className="mr-2" />
                          Username
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
                            className="flex flex-row space-x-2"
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

              {/* =========== STEP 2: Interests =========== */}
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

              {/* =========== STEP 3: Location & Picture =========== */}
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
                          <FormControl>
                            <Input
                              {...field} 
                              placeholder="Enter your city"
                              className="border-secondary text-lg rounded-full"
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^[a-zA-ZäöüÄÖÜß\s]*$/.test(value)) {
                                  field.onChange(value); 
                                }
                              }}
                            />
                          </FormControl>
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
                          Profile Picture (Optional)
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-24 h-24 border-2 border-primary">
                              <AvatarImage
                                src={profilePicturePreview || field.value}
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
                              onChange={handleProfilePictureChange}
                              className="border-secondary text-lg rounded-full cursor-pointer"
                            />
                          </div>
                        </FormControl>
                        {uploading && <Progress value={100} className="mt-2" />}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
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
                type="button"
                className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-6 py-3 rounded-full"
                disabled={!form.formState.isValid}
                onClick={form.handleSubmit(onSubmit)}
              >
                Create Profile
              </Button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
