import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        assets: { where: { type: "ORIGINAL" } },
        scenes: { select: { id: true, activeImageUrl: true, sceneName: true, status: true } },
      },
    });

    return NextResponse.json({ projects });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load projects" }, { status: 500 });
  }
}
