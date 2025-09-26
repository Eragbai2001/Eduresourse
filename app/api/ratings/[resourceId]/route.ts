import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { createServerClient } from "@supabase/ssr";

// Helper to extract resource id from request pathname
function extractResourceId(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.findIndex((p) => p === "ratings");
  return idx !== -1 ? parts[idx + 1] : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const pathname = req.nextUrl?.pathname ?? new URL(req.url).pathname;
    const resourceId = extractResourceId(pathname) as string | undefined;

    // Aggregate ratings
    try {
      const res = await prisma.$queryRaw`
        SELECT COUNT(*)::int as count, AVG(score)::numeric(3,2) as average
        FROM public.ratings
        WHERE resource_id = ${resourceId}
      `;
      const row = (res as unknown as Array<Record<string, unknown>>)[0] ?? {
        count: 0,
        average: null,
      };
      return NextResponse.json({
        count: Number(row.count || 0),
        average: row.average ? Number(row.average) : null,
      });
    } catch (qerr: unknown) {
      // If the ratings table doesn't exist yet, return empty aggregate instead of 500
      const msg = qerr instanceof Error ? qerr.message : String(qerr);
      if (
        msg.includes("does not exist") ||
        msg.includes('relation "public.ratings"')
      ) {
        console.warn(
          "ratings table missing; returning empty aggregate. Run `npx prisma db push` to create the table."
        );
        return NextResponse.json({ count: 0, average: null });
      }
      throw qerr;
    }
  } catch (err) {
    console.error("ratings GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { score, review } = body as { score?: number; review?: string };
    const pathname = req.nextUrl?.pathname ?? new URL(req.url).pathname;
    const resourceId = extractResourceId(pathname) as string | undefined;

    // authenticate via Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {
            return;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;

    if (typeof score !== "number" || score < 1 || score > 5) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Upsert rating (unique userId+resourceId)
    const ratingId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO public.ratings (id, user_id, resource_id, score, review)
      VALUES (${ratingId}, ${userId}, ${resourceId}, ${score}, ${review})
      ON CONFLICT (user_id, resource_id) DO UPDATE SET score = ${score}, review = ${review}, updated_at = now()
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ratings POST error:", err);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
