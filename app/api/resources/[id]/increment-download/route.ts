import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Extract the id from the pathname, e.g. /api/resources/:id/increment-download
    const pathname = req.nextUrl?.pathname ?? new URL(req.url).pathname;
    const parts = pathname.split("/").filter(Boolean);
    // parts should be ["api","resources",":id","increment-download"]
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
      data: { downloadCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("increment-download error:", err);
    return NextResponse.json(
      { error: "Failed to increment download count" },
      { status: 500 }
    );
  }
}
