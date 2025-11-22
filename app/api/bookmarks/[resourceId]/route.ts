import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// DELETE /api/bookmarks/:resourceId - remove a bookmark for the current user
export async function DELETE(_request: Request, { params }: { params: { resourceId: string } }) {
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

    const resourceId = params.resourceId;

    if (!resourceId) {
      return NextResponse.json({ error: "resourceId required" }, { status: 400 });
    }

    // Lazy-import Prisma to avoid build-time construction
    const { default: prisma } = await import("@/lib/prisma");

    // Try deleting by composite unique (userId + resourceId)
    const deleted = await prisma.bookmark.deleteMany({
      where: { userId: user.id, resourceId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ success: false, message: "Bookmark not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[DELETE /api/bookmarks/:resourceId] Error:', err);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}

// Optional: GET /api/bookmarks/:resourceId - check if bookmark exists for current user
export async function GET(_request: Request, { params }: { params: { resourceId: string } }) {
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

    const resourceId = params.resourceId;
    if (!resourceId) return NextResponse.json({ exists: false }, { status: 200 });

    const { default: prisma } = await import("@/lib/prisma");
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_resourceId: { userId: user.id, resourceId } },
    });

    return NextResponse.json({ exists: !!bookmark }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[GET /api/bookmarks/:resourceId] Error:', err);
    return NextResponse.json({ error: 'Failed to check bookmark' }, { status: 500 });
  }
}


