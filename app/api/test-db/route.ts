import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[DB Test] Testing Prisma connection...");

    // Test 1: Raw query
    const rawResult = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("[DB Test] Raw query successful:", rawResult);

    // Test 2: Count resources
    const count = await prisma.resource.count();
    console.log("[DB Test] Resource count:", count);

    // Test 3: Fetch one resource
    const oneResource = await prisma.resource.findFirst();
    console.log("[DB Test] Sample resource:", oneResource?.id);

    return NextResponse.json({
      success: true,
      connection: "working",
      rawQuery: rawResult,
      resourceCount: count,
      sampleResourceId: oneResource?.id || null,
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
