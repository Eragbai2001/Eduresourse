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
      coverColor,
      resourceCount,
      viewCount,
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
        coverColor,
        resourceCount,
        viewCount,
        downloadCount,
      },
    });

    return Response.json(resource, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(resources, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
