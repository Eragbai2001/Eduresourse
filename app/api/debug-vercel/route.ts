import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diagnostics: {
      timestamp: string;
      environment: Record<string, unknown>;
      runtime: Record<string, string>;
      database?: { status: string; error?: string };
      supabase?: { status: string; error?: string };
    } = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
      },
      runtime: {
        platform: process.platform,
        nodeVersion: process.version,
        arch: process.arch,
      },
    };

    // Try to connect to database
    try {
      const prisma = (await import("@/lib/prisma")).default;
      await prisma.$queryRaw`SELECT 1 as test`;
      diagnostics.database = { status: "connected" };
    } catch (dbError) {
      diagnostics.database = {
        status: "error",
        error: dbError instanceof Error ? dbError.message : String(dbError),
      };
    }

    // Try to connect to Supabase
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      const { error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      if (error) throw error;

      diagnostics.supabase = { status: "connected" };
    } catch (supabaseError) {
      diagnostics.supabase = {
        status: "error",
        error:
          supabaseError instanceof Error
            ? supabaseError.message
            : String(supabaseError),
      };
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Diagnostics failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
