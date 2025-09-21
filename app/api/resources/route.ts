import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      department,
      level,
      title,
      description,
      features,
      files,
      coverPhoto,
      resourceCount,
      downloadCount,
    } = body;

    const resource = await prisma.resource.create({
      data: {
        userId,
        department,
        level,
        title,
        description,
        features,
        files,
        coverPhoto,
        resourceCount,
        downloadCount,
      },
    });

    return Response.json(resource, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}