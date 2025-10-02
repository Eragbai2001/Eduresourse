import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Test 1: Check environment variables
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
    };

    // Test 2: Try a simple query
    const { error } = await supabase
      .from("resources")
      .select("count", { count: "exact", head: true });

    // Test 3: Check auth status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return NextResponse.json({
      success: !error,
      timestamp: new Date().toISOString(),
      environment: {
        ...envCheck,
        nodeEnv: process.env.NODE_ENV,
      },
      database: {
        connected: !error,
        error: error?.message || null,
        errorDetails: error || null,
      },
      auth: {
        hasSession: !!session,
        userId: session?.user?.id || null,
      },
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
