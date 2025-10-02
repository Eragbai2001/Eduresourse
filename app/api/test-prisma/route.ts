import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test Prisma connection
    const resourceCount = await prisma.resource.count();

    // Try to fetch one resource
    const firstResource = await prisma.resource.findFirst({
      select: {
        id: true,
        title: true,
        department: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      prisma: {
        connected: true,
        resourceCount,
        sampleResource: firstResource,
      },
      database: {
        url: process.env.DATABASE_URL ? "Set (hidden)" : "NOT SET",
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        name: err.name,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
