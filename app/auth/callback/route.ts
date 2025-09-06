import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    // Get the actual origin - this will be the vercel URL in production
    const origin = requestUrl.origin;
    console.log(`Auth callback processing on origin: ${origin}`);

    if (!code) {
      console.error("No code provided in callback");
      // Redirect to login with error if no code is provided
      return NextResponse.redirect(`${origin}/login?error=no_code`);
    }

    // Exchange the code for a session
    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_error`);
    }

    console.log("Successfully authenticated, redirecting to dashboard");
    // Successful authentication - redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    // Fallback to the homepage in case of any errors
    return NextResponse.redirect(new URL("/", request.url).toString());
  }
}
