"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

import { createClient } from "@/utils/supabase/server";
import { Provider } from "@supabase/supabase-js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
});

export async function login(data: z.infer<typeof loginSchema>) {
  const supabase = await createClient();

  const parsedData = loginSchema.safeParse(data);

  if (!parsedData.success) {
    throw new Error(JSON.stringify(parsedData.error.flatten()));
  }

  const { error } = await supabase.auth.signInWithPassword(parsedData.data);

  if (error) {
    throw new Error("Email or password is incorrect");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.log("User fetch error or no user:", userError);
    throw new Error("Failed to fetch user data");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(data: z.infer<typeof signupSchema>) {
  const supabase = await createClient();

  const parsedData = signupSchema.safeParse(data);

  if (!parsedData.success) {
    console.log("Signup validation failed:", parsedData.error);
    throw new Error(JSON.stringify(parsedData.error.flatten()));
  }

  const { error } = await supabase.auth.signUp({
    email: parsedData.data.email,
    password: parsedData.data.password,
    options: {
      data: {
        name: parsedData.data.name,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.log("User fetch error or no user:", userError);
    throw new Error("Failed to fetch user data");
  }

  console.log("User data:", userData);
  revalidatePath("/", "layout");
  redirect("/account-creation");
}

export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(data.url);
}

