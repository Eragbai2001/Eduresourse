import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

// DELETE /api/bookmarks/[resourceId] - Remove a bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
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

    const { resourceId } = params;

    if (!resourceId) {
      return NextResponse.json(
        { error: "resourceId is required" },
        { status: 400 }
      );
    }

    // Delete the bookmark
    await prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        resourceId: resourceId,
      },
    });

    return NextResponse.json(
      { message: "Bookmark removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/bookmarks/[resourceId]] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
