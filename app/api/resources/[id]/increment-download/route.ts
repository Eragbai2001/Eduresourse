import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.resource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
      
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to increment download count" }, { status: 500 });
  }
}

