import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.delete({
            name,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // List of public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/auth",
    "/manifest.webmanifest",
    "/manifest.json",
    "/favicon.ico",
    "/sw.js",
    "/icon-192x192.png",
    "/icon-512x512.png",
  ];

  if (
    !user &&
    !publicRoutes.some((route) => request.nextUrl.pathname === route)
  ) {
    // If there's no user and the route is not public, redirect to the login page
    const redirectUrl = new URL("/login", request.nextUrl.origin);
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Update the response headers to prevent caching for authenticated routes
  if (user && !publicRoutes.includes(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  return response;
}
