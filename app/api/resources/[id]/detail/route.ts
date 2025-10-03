import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Resource {
  id: string;
  userId: string;
  department: string;
  level: string;
  title: string;
  description: string;
  features: string[];
  files: string[];
  coverPhoto: string | null;
  coverColor: string | null;
  resourceCount: number;
  downloadCount: number;
  viewCount: number;
  createdAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the resource
    const resources = await prisma.$queryRawUnsafe<Resource[]>(
      `SELECT * FROM "Resource" WHERE id = $1 LIMIT 1`,
      id
    );

    if (!resources || resources.length === 0) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    const resource = resources[0];

    // Increment view count
    await prisma.$queryRawUnsafe(
      `UPDATE "Resource" SET "viewCount" = "viewCount" + 1 WHERE id = $1`,
      id
    );

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    );
  }
}
