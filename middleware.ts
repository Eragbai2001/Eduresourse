import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for server components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if this is an auth-related route
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  // Allow auth callback to proceed
  if (isAuthCallback) {
    return response;
  }

  // Protect dashboard routes
  // IMPORTANT: Skip session check immediately after auth callback to allow cookies to settle
  const referer = request.headers.get("referer");
  const comingFromAuthCallback = referer?.includes("/auth/callback");

  if (isDashboard && !session && !comingFromAuthCallback) {
    const redirectUrl = new URL("/login", request.url);
    // Store the original URL (including query params) so we can redirect back after login
    redirectUrl.searchParams.set(
      "redirectTo",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from login page
  if (isLoginPage && session) {
    // Check if there's a redirectTo parameter
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const redirectUrl = new URL(redirectTo || "/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Configure which routes should run the middleware
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/auth/callback"],
};
