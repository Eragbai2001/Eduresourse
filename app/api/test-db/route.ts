import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[DB Test] Testing Prisma connection...");

    // Test 1: Raw query
    const rawResult = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("[DB Test] Raw query successful:", rawResult);

    // Test 2: Check actual column names
    const columnQuery = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Resource'
      LIMIT 10
    `;
    console.log("[DB Test] Columns:", columnQuery);

    // Test 3: Fetch first resource with raw SQL to see structure
    const rawResource =
      await prisma.$queryRaw`SELECT * FROM public."Resource" LIMIT 1`;
    console.log("[DB Test] Raw resource:", rawResource);

    return NextResponse.json({
      success: true,
      connection: "working",
      rawQuery: rawResult,
      columns: columnQuery,
      sampleResource: rawResource,
    });
  } catch (error) {
    const err = error as { message?: string; code?: string; meta?: unknown };
    console.error("[DB Test] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Unknown error",
        code: err.code,
        meta: err.meta,
      },
      { status: 500 }
    );
  }
}
