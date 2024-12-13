"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/auth/supabseClient"; 
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/AuthContext";

const formSchemaLogin = z.object({
    email: z.string().email({ message: "Bitte eine gültige E-Mail-Adresse eingeben" }),
    password: z.string().min(6, { message: "Passwort muss mindestens 6 Zeichen lang sein" }),
  });
  
  const formSchemaSignup = z.object({
    name: z.string().max(10, { message: "Bitte gebe deinen Name ein"}),
    email: z.string().email({ message: "Bitte eine gültige E-Mail-Adresse eingeben" }),
    password: z.string().min(6, { message: "Passwort muss mindestens 6 Zeichen lang sein" }),
    passwordConfirm: z.string().min(6, { message: "Passwort muss mindestens 6 Zeichen lang sein" }),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein.",
    path: ["passwordConfirm"],
  });
  
  export default function LoginPage() {
    const { session } = useAuth();
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [mode, setMode] = useState<"login" | "signup">("login");
  
    const form = useForm<z.infer<typeof formSchemaSignup>>({
      resolver: zodResolver(mode === "login" ? formSchemaLogin : formSchemaSignup),
      defaultValues: {
        email: '',
        password: '',
        passwordConfirm: '',
        name: ''
      },
    });
  
    if (session) {
      // Wenn bereits eingeloggt, weiterleiten
      router.push("/");
    }
  
    const onSubmit = async (values: z.infer<typeof formSchemaSignup>) => {
      setErrorMsg("");
  
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password
        });
  
        if (error) {
          setErrorMsg(error.message);
          return;
        }
  
        // Wenn Login erfolgreich, weiterleiten
        router.push("/");
      } else {
        // Signup
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
                name: values.name
            }
          }
        });
  
        if (error) {
          setErrorMsg(error.message);
          return;
        }
  
        // Je nach Supabase-Einstellung kann hier eine E-Mail-Confirmation erforderlich sein.
        // Du könntest dem User mitteilen, dass er seine E-Mails checken soll.
        // Falls keine Confirm-Mail nötig ist und der User direkt eingeloggt ist, kannst du auch direkt weiterleiten.
        router.push("/");
      }
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <div className="w-full max-w-sm p-6 bg-card rounded-md shadow">
          <h1 className="text-2xl font-bold mb-4">{mode === "login" ? "Login" : "Sign Up"}</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {mode === "signup" && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jannik ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              )}

              {/* E-Mail Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input placeholder="deine@email.de" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Passwort Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
  
              {mode === "signup" && (
                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passwort bestätigen</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
  
              {errorMsg && (
                <p className="text-sm text-red-500">{errorMsg}</p>
              )}
  
              <Button type="submit" className="w-full">
                {mode === "login" ? "Anmelden" : "Registrieren"}
              </Button>
  
            </form>
          </Form>
          
          <div className="mt-4 text-sm text-center">
            {mode === "login" ? (
              <>
                Noch keinen Account?{" "}
                <button
                  className="underline"
                  onClick={() => setMode("signup")}
                >
                  Registrieren
                </button>
              </>
            ) : (
              <>
                Bereits einen Account?{" "}
                <button
                  className="underline"
                  onClick={() => setMode("login")}
                >
                  Anmelden
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }