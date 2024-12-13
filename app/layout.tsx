"use client";
import AuthProvider from "@/lib/auth/AuthProvider";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log(loading, session, pathname)
    if (!loading && !session && pathname !== '/login') {
      router.push('/login');
    }
  }, [session, loading, router, pathname]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
