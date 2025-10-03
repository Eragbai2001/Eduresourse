import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[parts.length - 1];
  if (!id) return Response.json(null, { status: 200 });

  // Retry logic to handle Supabase prepared statement caching issues
  const maxRetries = 2;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Use $queryRawUnsafe to completely bypass prepared statements (no caching)
      // Column names are camelCase in the database (Prisma default naming)
      const rows: unknown[] = await prisma.$queryRawUnsafe(`
        SELECT 
          id, "userId", department, level, title, description,
          features, files, "coverPhoto", "coverColor",
          "resourceCount", "downloadCount", "viewCount", "createdAt"
        FROM public."Resource"
        WHERE id = '${id}'
        LIMIT 1
      `);

      const resource = rows[0] ?? null;
      return Response.json(resource, { status: 200 });
    } catch (error) {
      lastError = error;
      const err = error as { message?: string; code?: string };

      // Check if it's a prepared statement error (code 42P05 or P2010)
      const isPreparedStatementError =
        err.code === "P2010" ||
        err.message?.includes("42P05") ||
        err.message?.includes("prepared statement");

      if (isPreparedStatementError && attempt < maxRetries) {
        console.warn(
          `[API] Prepared statement error on resource fetch, retrying... (${
            attempt + 1
          }/${maxRetries + 1})`
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      console.error("/api/resources/[id] GET error:", error);
      return Response.json(
        { error: "Failed to fetch resource" },
        { status: 500 }
      );
    }
  }

  // If all retries failed
  console.error("/api/resources/[id] GET error after retries:", lastError);
  return Response.json(
    { error: "Failed to fetch resource after retries" },
    { status: 500 }
  );
}
