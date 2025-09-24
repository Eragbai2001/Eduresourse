import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const pathname = req.nextUrl?.pathname ?? new URL(req.url).pathname;
    const parts = pathname.split("/").filter(Boolean);
    const resourcesIndex = parts.findIndex((p) => p === "resources");
    const id = resourcesIndex !== -1 ? parts[resourcesIndex + 1] : undefined;

    if (!id) {
      return NextResponse.json(
        { error: "Missing resource id" },
        { status: 400 }
      );
    }

    await prisma.resource.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("increment-view error:", err);
    return NextResponse.json(
      { error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
