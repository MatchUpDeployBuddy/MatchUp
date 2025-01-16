"use client";

import { Toaster } from "@/components/ui/sonner";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from "@/components/user-provider";
import { Navbar } from "@/components/ui/navbar";
import { EventProvider } from "@/components/EventProvider";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isLandingPage = pathname === "/" || pathname === "/landingpage";
  const isLogin = pathname === "/login";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center" />
        <UserProvider>
          <EventProvider>{children}</EventProvider>
        </UserProvider>
        {!isLandingPage && !isLogin && <Navbar />}
      </body>
    </html>
  );
}
