import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import prisma from "@/lib/db";
import { getVisionProvider } from "@/lib/providers";
import { ProductAnalysisSchema } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { assets: true, analysis: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If analysis already exists, return it
    if (project.analysis) {
      return NextResponse.json({
        analysis: {
          product_name: project.analysis.productName,
          category: project.analysis.category,
          materials: project.analysis.materials || "",
          colors: project.analysis.colors || "",
          shape: project.analysis.shape || "",
          key_features: project.analysis.keyFeatures || "",
          brand_text_visible: project.analysis.brandTextVisible || "",
          target_audience: project.analysis.targetAudience || "",
          price_tier: project.analysis.priceTier || "Premium",
          suggested_markets: project.analysis.suggestedMarkets ? JSON.parse(project.analysis.suggestedMarkets) : [],
          suggested_angles: project.analysis.suggestedAngles ? JSON.parse(project.analysis.suggestedAngles) : [],
          do_not_change: JSON.parse(project.analysis.doNotChange || "[]"),
        },
      });
    }

    const originalAsset = project.assets.find((a) => a.type === "ORIGINAL");
    if (!originalAsset) {
      return NextResponse.json({ error: "No original product asset found" }, { status: 400 });
    }

    // Read asset buffer
    let imageBase64 = "";
    if (originalAsset.url.startsWith("data:")) {
      imageBase64 = originalAsset.url;
    } else if (originalAsset.url.startsWith("/demo/")) {
      const demoFilePath = path.join(process.cwd(), "public", originalAsset.url);
      const buffer = await fs.readFile(demoFilePath);
      imageBase64 = buffer.toString("base64");
    } else if (originalAsset.url.startsWith("/uploads/")) {
      try {
        const uploadFilePath = path.join(process.cwd(), "public", originalAsset.url);
        const buffer = await fs.readFile(uploadFilePath);
        imageBase64 = buffer.toString("base64");
      } catch (e) {
        console.warn("Could not read local upload file:", e);
      }
    }

    const vision = getVisionProvider();
    const analysis = await vision.analyzeProduct(imageBase64, originalAsset.mimeType || "image/jpeg");

    // Save to DB
    const saved = await prisma.analysis.create({
      data: {
        projectId: project.id,
        productName: analysis.product_name,
        category: analysis.category,
        materials: analysis.materials,
        colors: analysis.colors,
        shape: analysis.shape,
        keyFeatures: analysis.key_features,
        brandTextVisible: analysis.brand_text_visible,
        targetAudience: analysis.target_audience,
        priceTier: analysis.price_tier,
        suggestedMarkets: JSON.stringify(analysis.suggested_markets),
        suggestedAngles: JSON.stringify(analysis.suggested_angles),
        doNotChange: JSON.stringify(analysis.do_not_change),
        rawResponse: JSON.stringify(analysis),
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        name: analysis.product_name || project.name,
        status: "ANALYZED",
      },
    });

    return NextResponse.json({ analysis });
  } catch (err: any) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: err.message || "Product analysis failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { projectId, analysis } = await req.json();
    if (!projectId || !analysis) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validated = ProductAnalysisSchema.parse(analysis);

    await prisma.analysis.upsert({
      where: { projectId },
      update: {
        productName: validated.product_name,
        category: validated.category,
        materials: validated.materials,
        colors: validated.colors,
        shape: validated.shape,
        keyFeatures: validated.key_features,
        brandTextVisible: validated.brand_text_visible,
        targetAudience: validated.target_audience,
        priceTier: validated.price_tier,
        suggestedMarkets: JSON.stringify(validated.suggested_markets),
        suggestedAngles: JSON.stringify(validated.suggested_angles),
        doNotChange: JSON.stringify(validated.do_not_change),
      },
      create: {
        projectId,
        productName: validated.product_name,
        category: validated.category,
        materials: validated.materials,
        colors: validated.colors,
        shape: validated.shape,
        keyFeatures: validated.key_features,
        brandTextVisible: validated.brand_text_visible,
        targetAudience: validated.target_audience,
        priceTier: validated.price_tier,
        suggestedMarkets: JSON.stringify(validated.suggested_markets),
        suggestedAngles: JSON.stringify(validated.suggested_angles),
        doNotChange: JSON.stringify(validated.do_not_change),
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { name: validated.product_name },
    });

    return NextResponse.json({ success: true, analysis: validated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update analysis" }, { status: 500 });
  }
}
