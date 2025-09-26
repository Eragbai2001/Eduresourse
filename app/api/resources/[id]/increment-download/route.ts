import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { createServerClient } from "@supabase/ssr";
// ...existing code... (removed unused imports)

// ...existing code... (removed unused email helper)

// Helper to extract resource id from pathname
function extractResourceId(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const resourcesIndex = parts.findIndex((p) => p === "resources");
  return resourcesIndex !== -1 ? parts[resourcesIndex + 1] : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const pathname = req.nextUrl?.pathname ?? new URL(req.url).pathname;
    const id = extractResourceId(pathname);

    if (!id) {
      return NextResponse.json(
        { error: "Missing resource id" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const debugEnabled =
      url.searchParams.get("debug") === "1" ||
      req.headers.get("x-debug") === "1";
    const debug: Record<string, unknown> = {};

    // Read body early so we can fallback to client-provided userId if needed
    const body = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    if (debugEnabled) debug.requestBody = body;

    // Derive authenticated user via Supabase server client (cookies or Authorization Bearer)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {
            // no-op for API routes
            return;
          },
        },
      }
    );

    // Try to get authenticated user, but do not require it for incrementing download counts.
    let userId: string | undefined = undefined;
    try {
      const resp = await supabase.auth.getUser();
      userId = resp.data?.user?.id;
    } catch {
      // no authenticated user available; continue without failing
      userId = undefined;
    }
    // Fallback: if no session-derived userId, trust client-sent body as a last resort
    if (!userId && body && typeof body.userId === "string") {
      userId = body.userId as string;
      if (debugEnabled) debug.userIdSource = "body";
    } else if (userId && debugEnabled) {
      debug.userIdSource = "session";
    }

    // Perform a transaction: increment downloadCount and optionally create a reminder record
    const now = new Date();
    // Schedule the reminder for 24 hours from now. Update this value to change the delay.
    const scheduled = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

    // Increment download count and create a reminder entry if needed.
    const updated = await prisma.resource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
    if (debugEnabled) debug.updatedDownloadCount = updated.downloadCount;

    if (userId) {
      // Insert a reminder row if none exists. $executeRaw returns the number of
      // affected rows; if 1 it means we created the row now and should send mail.
      // Use a raw INSERT that provides an id with gen_random_uuid() to avoid NOT NULL
      // errors and rely on ON CONFLICT DO NOTHING to skip duplicates. The
      // returned value is the number of rows affected; when 1 it means we inserted.
      const reminderId = randomUUID();
      const result: unknown = await prisma.$executeRaw`
        INSERT INTO public.download_reminders (id, user_id, resource_id, first_downloaded_at, reminder_scheduled_at, status, created_at)
        VALUES (${reminderId}, ${userId}, ${id}, ${now}, ${scheduled}, ${"scheduled"}, ${now})
        ON CONFLICT (user_id, resource_id) DO NOTHING
      `;

      // Some drivers return 1 for inserted row; cast defensively
      const insertedRows = Number(result as number | null);
      if (debugEnabled) debug.insertedRows = insertedRows;
      if (insertedRows > 0) {
        // Reminder row created and scheduled for later delivery. Do NOT send
        // the email immediately here. The scheduler (app/api/reminders/process)
        // should find rows with reminder_scheduled_at <= now and send them.
        console.log("[increment-download] reminder scheduled", {
          userId,
          resourceId: id,
          scheduled,
        });
        if (debugEnabled) {
          debug.scheduled = scheduled.toISOString();
          debug.note =
            "Reminder scheduled; no immediate email sent. Use scheduler to process reminders after 24h.";
        }
      }
    }

    const responseBody: Record<string, unknown> = { success: true };
    if (debugEnabled) responseBody.debug = debug;
    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("increment-download error:", err);
    return NextResponse.json(
      { error: "Failed to increment download count" },
      { status: 500 }
    );
  }
}
