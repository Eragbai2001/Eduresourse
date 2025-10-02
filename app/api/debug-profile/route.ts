import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get all profiles with their avatar_url to see what format they're in
    const profiles = await prisma.profile.findMany({
      select: {
        userId: true,
        email: true,
        fullName: true,
        displayName: true,
        avatarUrl: true,
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      count: profiles.length,
      profiles: profiles,
    });
  } catch (error) {
    console.error("Debug profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles", details: String(error) },
      { status: 500 }
    );
  }
}
