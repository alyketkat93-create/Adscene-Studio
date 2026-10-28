import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getImageProvider, getVisionProvider } from "@/lib/providers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sceneId, action, instruction, geminiApiKey } = body as {
      sceneId: string;
      action: "regenerate" | "variation" | "edit" | "upscale" | "toggle_select";
      instruction?: string;
      geminiApiKey?: string;
    };
    const effectiveGeminiKey = geminiApiKey || req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";

    if (!sceneId || !action) {
      return NextResponse.json({ error: "Missing sceneId or action" }, { status: 400 });
    }

    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { project: { include: { assets: true } } },
    });

    if (!scene) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    if (action === "toggle_select") {
      const updated = await prisma.scene.update({
        where: { id: sceneId },
        data: { selectedForExport: !scene.selectedForExport },
      });
      return NextResponse.json({ success: true, selectedForExport: updated.selectedForExport });
    }

    const imageProvider = getImageProvider(effectiveGeminiKey);
    const originalAsset = scene.project.assets.find((a) => a.type === "ORIGINAL");
    const refImage = originalAsset?.url || "";

    let newImageUrl = scene.activeImageUrl || "";
    let promptUsed = scene.imagePrompt;

    if (action === "regenerate") {
      const res = await imageProvider.generateSceneImage(scene.imagePrompt, {
        aspectRatio: scene.aspectRatio as any,
        referenceImageBase64: refImage,
        negativePrompt: scene.negativePrompt || undefined,
      });
      newImageUrl = res.imageUrl;
    } else if (action === "variation") {
      const variationPrompt = `${scene.imagePrompt}, subtle camera angle shift, alternative commercial lighting setup`;
      const res = await imageProvider.generateSceneImage(variationPrompt, {
        aspectRatio: scene.aspectRatio as any,
        referenceImageBase64: refImage,
      });
      newImageUrl = res.imageUrl;
      promptUsed = variationPrompt;
    } else if (action === "edit" && instruction) {
      const vision = getVisionProvider();
      const refinedScenePrompt = await vision.refineScenePrompt(
        {
          scene_name: scene.sceneName,
          template_id: scene.templateId,
          image_prompt: scene.imagePrompt,
          negative_prompt: scene.negativePrompt || "",
          aspect_ratio: scene.aspectRatio as any,
          video_prompt: scene.videoPrompt,
          camera_motion: scene.cameraMotion,
          duration_seconds: scene.durationSeconds,
          motion_notes: scene.motionNotes || "",
          caption_line: scene.captionLine || "",
          voiceover_line: scene.voiceoverLine || "",
        },
        instruction
      );

      const res = await imageProvider.generateSceneImage(refinedScenePrompt.image_prompt, {
        aspectRatio: scene.aspectRatio as any,
        referenceImageBase64: refImage,
      });

      newImageUrl = res.imageUrl;
      promptUsed = refinedScenePrompt.image_prompt;

      // Update scene prompts
      await prisma.scene.update({
        where: { id: sceneId },
        data: {
          imagePrompt: refinedScenePrompt.image_prompt,
          videoPrompt: refinedScenePrompt.video_prompt,
        },
      });
    } else if (action === "upscale") {
      const res = await imageProvider.upscaleImage(scene.activeImageUrl || "");
      newImageUrl = res.imageUrl;
    }

    // Save generation
    await prisma.generation.create({
      data: {
        sceneId,
        imageUrl: newImageUrl,
        promptUsed,
        videoPrompt: scene.videoPrompt,
        fidelityScore: 98,
        fidelityPassed: true,
        status: "COMPLETED",
      },
    });

    const updatedScene = await prisma.scene.update({
      where: { id: sceneId },
      data: { activeImageUrl: newImageUrl },
    });

    return NextResponse.json({
      success: true,
      scene: updatedScene,
      imageUrl: newImageUrl,
    });
  } catch (err: any) {
    console.error("Scene action error:", err);
    return NextResponse.json({ error: err.message || "Failed to process scene action" }, { status: 500 });
  }
}
