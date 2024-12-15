"use client";
import { login, signup, signInWithOAuth } from './actions';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

// Zod Schema Definition
const formSchemaLogin = z.object({
  email: z.string().email({ message: 'Bitte eine gültige E-Mail-Adresse eingeben' }),
  password: z.string().min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' }),
});

const formSchemaSignup = z
  .object({
    name: z.string().min(1, { message: 'Name ist erforderlich' }).max(10, { message: 'Name darf maximal 10 Zeichen haben' }),
    email: z.string().email({ message: 'Bitte eine gültige E-Mail-Adresse eingeben' }),
    password: z.string().min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' }),
    passwordConfirm: z.string().min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwörter stimmen nicht überein.',
    path: ['passwordConfirm'],
  });

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const form = useForm<
    typeof formSchemaLogin extends z.ZodType<any>
      ? z.infer<typeof formSchemaLogin>
      : z.infer<typeof formSchemaSignup>
  >({
    resolver: zodResolver(mode === 'login' ? formSchemaLogin : formSchemaSignup),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-sm p-6 bg-card rounded-md shadow">
        <h1 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Sign Up'}</h1>
        <Form {...form}>
          <form
            action={mode === 'login' ? login : signup}
            className="space-y-4"
          >
            {mode === 'signup' && (
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="deine@email.de" {...field} />
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
                  <FormLabel>Passwort</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'signup' && (
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

            <Button type="submit" className="w-full">
              {mode === 'login' ? 'Anmelden' : 'Registrieren'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                signInWithOAuth("google");
              }}
            >
              Login with Google
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-sm text-center">
          {mode === 'login' ? (
            <>
              Noch keinen Account?{' '}
              <button className="underline" onClick={() => setMode('signup')}>
                Registrieren
              </button>
            </>
          ) : (
            <>
              Bereits einen Account?{' '}
              <button className="underline" onClick={() => setMode('login')}>
                Anmelden
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
