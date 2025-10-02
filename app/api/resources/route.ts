import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      department,
      level,
      title,
      description,
      features,
      files,
      coverPhoto,
      coverColor,
      resourceCount,
      viewCount,
      downloadCount,
    } = body;

    // Ensure user profile exists before creating resource
    // Get user from session
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
    } = await supabase.auth.getUser();

    if (user && user.id === userId) {
      // Check if profile exists
      const existingProfile = await prisma.profile.findFirst({
        where: { userId },
      });

      if (existingProfile) {
        // Update existing profile
        await prisma.profile.update({
          where: { id: existingProfile.id },
          data: {
            email: user.email || existingProfile.email,
            fullName: user.user_metadata?.full_name || existingProfile.fullName,
            displayName:
              user.user_metadata?.display_name ||
              user.user_metadata?.name ||
              existingProfile.displayName,
            avatarUrl:
              user.user_metadata?.avatar_url || existingProfile.avatarUrl,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new profile
        await prisma.profile.create({
          data: {
            userId,
            email: user.email || null,
            fullName: user.user_metadata?.full_name || null,
            displayName:
              user.user_metadata?.display_name ||
              user.user_metadata?.name ||
              null,
            avatarUrl: user.user_metadata?.avatar_url || null,
          },
        });
      }
    }

    const resource = await prisma.resource.create({
      data: {
        userId,
        department,
        level,
        title,
        description,
        features,
        files,
        coverPhoto,
        coverColor,
        resourceCount,
        viewCount,
        downloadCount,
      },
    });

    return Response.json(resource, { status: 200 });
  } catch (error) {
    console.error("[API] Error creating resource:", error);
    return Response.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("[API] Fetching resources from database...");
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log(`[API] Successfully fetched ${resources.length} resources`);
    return Response.json(resources, { status: 200 });
  } catch (error) {
    const err = error as { message?: string; code?: string; meta?: unknown };
    console.error("[API] Error fetching resources:", error);
    console.error("[API] Error details:", {
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
    return Response.json(
      {
        error: "Failed to fetch resources",
        details: err.message || "Unknown error",
        code: err.code || "UNKNOWN",
      },
      { status: 500 }
    );
  }
}
