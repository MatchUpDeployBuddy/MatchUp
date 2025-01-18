"use client";

import { login, signup, signInWithOAuth } from "./actions";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGoogle, FaLock, FaUser } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

const formSchemaLogin = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const formSchemaSignup = z
  .object({
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const fetchUser = useUserStore((state) => state.fetchUser);

  const form = useForm<
    z.infer<typeof formSchemaLogin> | z.infer<typeof formSchemaSignup>
  >({
    resolver: zodResolver(
      mode === "login" ? formSchemaLogin : formSchemaSignup
    ),
    defaultValues: {
      // Remove `name` since it’s no longer part of signup
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (
    data: z.infer<typeof formSchemaLogin> | z.infer<typeof formSchemaSignup>
  ) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      if (mode === "login") {
        const response = await login(data as z.infer<typeof formSchemaLogin>);
        if (response?.loginSuccess) {
          await fetchUser();
          router.push("/dashboard");
        }
      } else {
        const response = await signup(data as z.infer<typeof formSchemaSignup>);
        if (response?.signupSuccess) {
          setSuccessMessage("Account created successfully!");
          router.push("/account-creation");
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-x p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8">MatchUp</h1>
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

        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as "login" | "signup")}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="login"
              className="text-lg flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="text-lg flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
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
              {/* --------------------
                  LOGIN TAB
              -------------------- */}
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
                              placeholder="john.doe@example.com"
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
                      disabled={isLoading}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-6 py-3 rounded-full flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Spinner />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* --------------------
                  SIGNUP TAB
              -------------------- */}
              <TabsContent value="signup">
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
                      disabled={isLoading}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-6 py-3 rounded-full flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Spinner />
                          Signing up...
                        </>
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full border-primary hover:bg-primary/10 text-lg px-6 py-3 rounded-full flex items-center justify-center"
              onClick={() => signInWithOAuth("google")}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Processing...
                </>
              ) : (
                <>
                  <FaGoogle className="mr-2" />
                  Login with Google
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
