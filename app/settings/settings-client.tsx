"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FaUser, FaBell, FaQuestionCircle, FaUserPlus } from "react-icons/fa";
import { useUserStore } from "@/store/userStore";
import { Buddy } from "@/types";
import { uploadProfilePicture } from "@/utils/supabase/storage";
import { z } from "zod";
import { toast } from "sonner";
import { logout } from "../logout/action";
import { useRouter } from "next/navigation";
import { useOneSignalStore } from "@/store/oneSignalStore";
import OneSignal from "react-onesignal";

const settingsSections = [
  { id: "account", title: "Account", icon: FaUser },
  { id: "notifications", title: "Notifications", icon: FaBell },
  { id: "help", title: "Help Center", icon: FaQuestionCircle },
  { id: "invite", title: "Invite Friends", icon: FaUserPlus },
];

const userSchema = z.object({
  userId: z.string(),
  username: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be 50 characters or less" }),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format",
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

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateUser } = useUserStore((state) => state);
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();

  const renderSectionContent = () => {
    switch (activeSection) {
      case "account":
        return (
          user && (
            <AccountSettings
              user={user}
              updateUser={updateUser}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          )
        );
      case "notifications":
        return <NotificationSettings />;
      case "help":
        return <HelpCenter />;
      case "invite":
        return <InviteFriends />;
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result?.success) {
      clearUser();
      router.push("/");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        User not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-x p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-text-primary mb-8">
          Settings
        </h1>
        {/* Logout Button */}
        <div className="flex justify-end mb-4">
          <Button onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage
                    src={user.profile_picture_url!}
                    alt="Profile picture"
                  />
                  <AvatarFallback>{user.username!.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">{user.username}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              {/* Nur anzeigen, wenn activeSection === "account" */}
              {activeSection === "account" && !isEditing && (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  Edit
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 space-y-2">
                {settingsSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon className="mr-2 h-4 w-4" />
                    {section.title}
                  </Button>
                ))}
              </div>
              <div className="w-full md:w-2/3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderSectionContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccountSettings({
  user,
  updateUser,
  isEditing,
  setIsEditing,
}: {
  user: Buddy;
  updateUser: (user: Partial<Buddy>) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}) {
  const [formData, setFormData] = useState(user);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [cacheBust, setCacheBust] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSportToggle = (sport: string) => {
    const updatedSports = (formData.sport_interests ?? []).includes(sport)
      ? (formData.sport_interests ?? []).filter((s) => s !== sport)
      : [...(formData.sport_interests ?? []), sport];
    setFormData({ ...formData, sport_interests: updatedSports });
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation will also be done in the backend
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      const allowedTypes = ["image/jpeg", "image/png"];

      if (file.size > MAX_SIZE) {
        toast.error("File size exceeds 2MB");
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a JPEG or PNG image");
        return;
      }

      setProfilePictureFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const result = userSchema.safeParse({
      userId: formData.id,
      username: formData.username,
      birthday: formData.birthday,
      gender: formData.gender_enum,
      sportInterests: formData.sport_interests,
      city: formData.city,
      profilePicture: formData.profile_picture_url,
    });
    if (!result.success) {
      return false;
    }
    return true;
  };

  const isDifferent = (formData: Buddy): boolean => {
    const isEqual = (obj1: Buddy, obj2: Buddy): boolean => {
      return Object.keys(obj1).every((key) => {
        const value1 = obj1[key as keyof Buddy];
        const value2 = obj2[key as keyof Buddy];

        if (Array.isArray(value1) && Array.isArray(value2)) {
          return (
            value1.length === value2.length &&
            value1.every((val, index) => val === value2[index])
          );
        }
        return value1 === value2;
      });
    };

    const hasChanged = !isEqual(formData, user);

    return hasChanged;
  };

  const handleSubmit = async () => {
    if (profilePictureFile) {
      const uploadedUrl = await uploadProfilePicture(profilePictureFile);
      if (uploadedUrl) {
        formData.profile_picture_url = uploadedUrl;
        setCacheBust((prev) => prev + 1);
      } else {
        toast.error("Could not upload profile picture");
      }
    }

    if (!validate()) {
      toast("An error occurred while updating the user data");
      setProfilePicturePreview(null);
      setProfilePictureFile(null);
      return;
    } else if (!isDifferent(formData)) {
      setProfilePicturePreview(null);
      setProfilePictureFile(null);
      setIsEditing(false);
      return;
    }
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: formData.id,
          username: formData.username,
          birthday: formData.birthday,
          gender: formData.gender_enum,
          sportInterests: formData.sport_interests,
          city: formData.city,
          profilePicture: formData.profile_picture_url,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error updating user");
      }
      setProfilePicturePreview(null);
      setProfilePictureFile(null);
      updateUser(result.data[0]);
      setIsEditing(false);
      toast.success("User data updated successfully");
    } catch (error: unknown) {
      console.error("Update failed:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
      <Label htmlFor="profilePicture">Profile Picture</Label>
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16 border-2 border-primary">
          <AvatarImage
            key={`${formData.profile_picture_url}-${cacheBust}`}
            src={profilePicturePreview || user.profile_picture_url!}
            alt="Profile picture"
          />
          <AvatarFallback>{user.username!.charAt(0)}</AvatarFallback>
        </Avatar>
        {isEditing && (
          <div>
            <Input
              type="file"
              accept="image/*"
              className="border-secondary text-lg rounded-full cursor-pointer"
              onChange={(e) => handleProfilePictureChange(e)}
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          value={formData.username!}
          onChange={handleInputChange}
          readOnly={!isEditing}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthday">Birthday</Label>
        <Input
          id="birthday"
          name="birthday"
          type="date"
          value={formData.birthday!}
          onChange={handleInputChange}
          readOnly={!isEditing}
        />
      </div>
      <div className="space-y-2">
        <Label>City</Label>
        <Input
          id="city"
          name="city"
          value={formData.city!}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[a-zA-ZäöüÄÖÜß\s]*$/.test(value)) {
              handleSelectChange("city", value); // Speichert die Eingabe
            }
          }}
          readOnly={!isEditing}
        />
      </div>
      <div className="space-y-2">
        <Label>Sport Interests</Label>
        <div className="grid grid-cols-2 gap-2">
          {sports.map((sport) => (
            <Button
              key={sport}
              variant={
                formData.sport_interests!.includes(sport)
                  ? "default"
                  : "outline"
              }
              onClick={() => handleSportToggle(sport)}
              disabled={!isEditing}
            >
              {sport}
            </Button>
          ))}
        </div>
      </div>
      {isEditing && (
        <Button onClick={handleSubmit} className="mt-4">
          Save Changes
        </Button>
      )}
    </div>
  );
}

function NotificationSettings() {
  const userId = useUserStore(state => state.user?.id);
  const { isInitialized, initializeOneSignal, subscribe, unsubscribe } = useOneSignalStore();
  const [matchNotificationsEnabled, setMatchNotificationsEnabled] =
    useState(false);


  useEffect(() => {
    if (userId && !isInitialized) {
      initializeOneSignal(userId);
    }
  }, [userId, initializeOneSignal, isInitialized]);

  useEffect(() => {
    const fetchNotificationState = async () => {
      if (!isInitialized) {
        console.log("OneSignal ist noch nicht initialisiert.");
        return;
      }

      try {
        const isSubscribed = await OneSignal.User.PushSubscription.optedIn
        console.log(isSubscribed)
        if (isSubscribed === undefined) {
          throw Error("Failed to get subscription info")
        }
        setMatchNotificationsEnabled(isSubscribed);
      } catch (err) {
        console.error("Fehler beim Abrufen des Abonnementstatus:", err);
        toast.error("Fehler beim Abrufen des Abonnementstatus.");
      }
    };

    fetchNotificationState();
  }, [isInitialized]);

  

  const handleToggleMatchNotifications = async () => {
    if (!isInitialized) {
      toast.error("Benachrichtigungen werden noch initialisiert.");
      return;
    }
    
    if (matchNotificationsEnabled) {
      await unsubscribe();
      console.log("unsub")
      setMatchNotificationsEnabled(false);
    } else {
      await subscribe();
      console.log("sub")
      setMatchNotificationsEnabled(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Match Notifications */}
      <div className="space-y-2">
        <Label>Match Notifications</Label>
        <div className="flex items-center justify-between">
          <span>Enable match notifications</span>
          <Switch
            checked={matchNotificationsEnabled}
            onCheckedChange={handleToggleMatchNotifications} // Setze den Zustand basierend auf der Auswahl
            className={`${
              matchNotificationsEnabled ? "bg-indigo-600" : "bg-gray-200"
            } relative inline-flex items-center h-6 rounded-full w-11`}
          >
            <span className="sr-only">Enable match notifications</span>
            <span
              className={`${
                matchNotificationsEnabled ? "translate-x-6" : "translate-x-1"
              } inline-block w-4 h-4 transform bg-white rounded-full`}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function HelpCenter() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Help Center</h3>
      <Button variant="outline" className="w-full justify-start">
        FAQs
      </Button>
      <Button variant="outline" className="w-full justify-start">
        Privacy Policy
      </Button>
      <Button variant="outline" className="w-full justify-start">
        Terms of Service
      </Button>
      <Button variant="outline" className="w-full justify-start">
        Contact Support
      </Button>
    </div>
  );
}

function InviteFriends() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Invite Friends</h3>
      <p>Share this link with your friends to invite them to our app:</p>
      <div className="flex space-x-2">
        <Input value="https://example.com/invite/johndoe" readOnly />
        <Button>Copy</Button>
      </div>
    </div>
  );
}
