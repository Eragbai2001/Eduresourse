import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface SearchResource {
  id: string;
  title: string;
  description: string;
  department: string;
  level: string;
  coverPhoto: string | null;
  coverColor: string | null;
  downloadCount: number;
  viewCount: number;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ resources: [] });
    }

    // Search across multiple fields using raw SQL for better performance
    const resources = await prisma.$queryRawUnsafe<SearchResource[]>(
      `
      SELECT 
        id,
        title,
        description,
        department,
        level,
        "coverPhoto",
        "coverColor",
        "downloadCount",
        "viewCount",
        "createdAt"
      FROM "Resource"
      WHERE 
        LOWER(title) LIKE LOWER($1)
        OR LOWER(description) LIKE LOWER($1)
        OR LOWER(department) LIKE LOWER($1)
        OR LOWER(level) LIKE LOWER($1)
      ORDER BY 
        "downloadCount" DESC,
        "createdAt" DESC
      LIMIT 10
      `,
      `%${query}%`
    );

    return NextResponse.json({ resources, count: resources.length });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search resources" },
      { status: 500 }
    );
  }
}
