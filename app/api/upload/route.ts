import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getStorageProvider } from "@/lib/providers";
import { checkRateLimit, validateContentSafety } from "@/lib/safety";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please slow down." }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const demoType = formData.get("demoType") as string | null;

    let buffer: Buffer;
    let filename: string;
    let mimeType: string;

    if (demoType) {
      // Use pre-configured demo product
      filename = `${demoType}.svg`;
      mimeType = "image/svg+xml";
      const demoPath = `/demo/${demoType}.svg`;
      
      const project = await prisma.project.create({
        data: {
          name: demoType === "perfume" ? "Oud Royale Perfume" : demoType === "serum" ? "Botanical Glow Serum" : "Titanium Cyber Watch",
          status: "UPLOADED",
        },
      });

      const asset = await prisma.asset.create({
        data: {
          projectId: project.id,
          type: "ORIGINAL",
          url: demoPath,
          filename,
          mimeType,
          width: 1024,
          height: 1024,
          size: 15000,
        },
      });

      return NextResponse.json({
        projectId: project.id,
        assetUrl: asset.url,
        width: 1024,
        height: 1024,
        resolutionWarning: false,
      });
    }

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds maximum size of 15MB" }, { status: 400 });
    }

    const safety = validateContentSafety(file.name);
    if (!safety.allowed) {
      return NextResponse.json({ error: safety.reason }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    filename = file.name || "product.jpg";
    mimeType = file.type || "image/jpeg";

    const storage = getStorageProvider();
    const assetUrl = await storage.saveFile(buffer, filename, mimeType);

    // Basic dimension inspection or fallback
    let width = 1024;
    let height = 1024;
    try {
      // If sharp is available, read true dimensions
      const sharp = (await import("sharp")).default;
      const metadata = await sharp(buffer).metadata();
      if (metadata.width) width = metadata.width;
      if (metadata.height) height = metadata.height;
    } catch {
      // Fallback
    }

    const resolutionWarning = width < 1024 || height < 1024;

    const project = await prisma.project.create({
      data: {
        name: filename.replace(/\.[^/.]+$/, ""),
        status: "UPLOADED",
      },
    });

    const asset = await prisma.asset.create({
      data: {
        projectId: project.id,
        type: "ORIGINAL",
        url: assetUrl,
        filename,
        mimeType,
        width,
        height,
        size: file.size,
      },
    });

    return NextResponse.json({
      projectId: project.id,
      assetUrl: asset.url,
      width,
      height,
      resolutionWarning,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
