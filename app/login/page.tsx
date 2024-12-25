"use client";
import { login, signup, signInWithOAuth } from "./actions";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGoogle, FaLock, FaUser } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

// Zod Schema Definition
const formSchemaLogin = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const formSchemaSignup = z
  .object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .max(50, { message: "Name must be 50 characters or less" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }
      ),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<
    z.infer<typeof formSchemaLogin> | z.infer<typeof formSchemaSignup>
  >({
    resolver: zodResolver(
      mode === "login" ? formSchemaLogin : formSchemaSignup
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (
    data: z.infer<typeof formSchemaLogin> | z.infer<typeof formSchemaSignup>
  ) => {
    try {
      if (mode === "login") {
        await login(data as z.infer<typeof formSchemaLogin>);
        setSuccessMessage("Logged in successfully!");
      } else {
        await signup(data as z.infer<typeof formSchemaSignup>);
        setSuccessMessage("Account created successfully!");
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Error:", error);
      setErrorMessage(error.message || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-x p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          MatchUp
        </h1>
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
        {message && (
          <div className="mb-4 text-sm text-center text-red-600 bg-red-100 border border-red-400 rounded-full p-2">
            {message}
          </div>
        )}
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "login" | "signup")}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-lg">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-lg">
              Sign Up
            </TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="login">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaUser className="mr-2" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@email.com"
                              {...field}
                              className="border-secondary text-md rounded-full placeholder-gray-400 placeholder-opacity-50 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaLock className="mr-2" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              className="border-secondary text-md rounded-full placeholder-gray-400 placeholder-opacity-50 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-6 py-3 rounded-full"
                    >
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="signup">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
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
                              placeholder="John Doe"
                              {...field}
                              className="border-secondary text-md rounded-full placeholder-gray-400 placeholder-opacity-50 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaUser className="mr-2" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@email.com"
                              {...field}
                              className="border-secondary text-md rounded-full placeholder-gray-400 placeholder-opacity-50 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaLock className="mr-2" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              className="border-secondary text-md rounded-full placeholder-gray-400 placeholder-opacity-50 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="passwordConfirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-primary flex items-center text-lg">
                            <FaLock className="mr-2" />
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              className="border-secondary text-md rounded-full placeholder-gray-400 placeholder-opacity-50 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-6 py-3 rounded-full"
                    >
                      Sign Up
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10 text-lg px-6 py-3 rounded-full flex items-center justify-center"
              onClick={() => signInWithOAuth("google")}
            >
              <FaGoogle className="mr-2" />
              Login with Google
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
