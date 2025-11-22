import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// NOTE: prisma is imported lazily inside handlers to avoid build-time issues

// GET /api/bookmarks - Get all bookmarks for the current user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lazy-import Prisma (prevents client construction at build-time)
    const { default: prisma } = await import("@/lib/prisma");

    // Get all bookmarks for this user
    // eslint-disable-next-line no-console
    console.log('[GET /api/bookmarks] userId=', user.id);
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return just the resource IDs
    const resourceIds = bookmarks.map((b) => b.resourceId);

    return NextResponse.json({ bookmarks: resourceIds }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/bookmarks] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks - Add a bookmark
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { resourceId } = body;

    // Lazy-import Prisma (prevents client construction at build-time)
    const { default: prisma } = await import("@/lib/prisma");

    // debug log (dev only)
    // eslint-disable-next-line no-console
    console.log('[POST /api/bookmarks] userId=', user.id, 'resourceId=', resourceId);

    if (!resourceId) {
      return NextResponse.json(
        { error: "resourceId is required" },
        { status: 400 }
      );
    }

    // Check if bookmark already exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId: resourceId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Bookmark already exists" },
        { status: 200 }
      );
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        resourceId: resourceId,
      },
    });

    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bookmarks] Error:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}
