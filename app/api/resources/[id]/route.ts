import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return Response.json(null, { status: 200 });

    const resource = await prisma.resource.findUnique({ where: { id } });

    // Return JSON (null if not found) to keep client parsing simple
    return Response.json(resource ?? null, { status: 200 });
  } catch (error) {
    console.error("/api/resources/[id] GET error:", error);
    return Response.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    );
  }
}
