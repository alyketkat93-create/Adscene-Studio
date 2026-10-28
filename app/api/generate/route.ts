import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateAllScenePrompts } from "@/lib/prompt-builder";
import { getImageProvider, getVisionProvider } from "@/lib/providers";
import { evaluateProductFidelity } from "@/lib/fidelity";
import { BriefFormData, ProductAnalysis } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, brief, language = "ar", geminiApiKey } = body as {
      projectId: string;
      brief: BriefFormData;
      language?: "ar" | "en";
      geminiApiKey?: string;
    };
    const effectiveGeminiKey = geminiApiKey || req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";

    if (!projectId || !brief) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { analysis: true, assets: true },
    });

    if (!project || !project.analysis) {
      return NextResponse.json({ error: "Project or analysis not found" }, { status: 404 });
    }

    // Save brief details to project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        targetMarket: brief.targetMarket,
        platform: brief.platform,
        aspectRatios: (brief.aspectRatios || []).join(","),
        tone: brief.tone,
        modelType: brief.modelType,
        modelDescription: brief.modelDescription,
        sceneCount: brief.sceneCount,
        brandColors: brief.brandColors,
        slogan: brief.slogan,
        extraNotes: brief.extraNotes,
        status: "GENERATING",
      },
    });

    // Create a tracked Job
    const job = await prisma.job.create({
      data: {
        projectId,
        type: "GENERATE_ALL",
        status: "PROCESSING",
        progress: 10,
        currentStep: "Synthesizing master prompts...",
      },
    });

    const analysisObj: ProductAnalysis = {
      product_name: project.analysis.productName,
      category: project.analysis.category,
      materials: project.analysis.materials || "",
      colors: project.analysis.colors || "",
      shape: project.analysis.shape || "",
      key_features: project.analysis.keyFeatures || "",
      brand_text_visible: project.analysis.brandTextVisible || "",
      target_audience: project.analysis.targetAudience || "",
      price_tier: (project.analysis.priceTier as any) || "Premium",
      suggested_markets: project.analysis.suggestedMarkets ? JSON.parse(project.analysis.suggestedMarkets) : [],
      suggested_angles: project.analysis.suggestedAngles ? JSON.parse(project.analysis.suggestedAngles) : [],
      do_not_change: JSON.parse(project.analysis.doNotChange || "[]"),
    };

    // 1. Build Scene Prompts
    const scenePrompts = generateAllScenePrompts(analysisObj, brief, language);
    const imageProvider = getImageProvider(effectiveGeminiKey);
    const visionProvider = getVisionProvider();
    const originalAsset = project.assets.find((a) => a.type === "ORIGINAL");
    const referenceBase64 = originalAsset?.url || "";

    // Clear old scenes if regenerating
    await prisma.scene.deleteMany({ where: { projectId } });

    const createdScenes = [];

    // 2. Generate each scene with automated fidelity check & auto-retry
    for (let i = 0; i < scenePrompts.length; i++) {
      const sp = scenePrompts[i];
      const stepPercent = Math.round(15 + ((i + 1) / scenePrompts.length) * 80);

      await prisma.job.update({
        where: { id: job.id },
        data: {
          progress: stepPercent,
          currentStep: `Rendering Scene ${i + 1}/${scenePrompts.length}: ${sp.scene_name}...`,
        },
      });

      // Attempt generation with auto-retry up to 2 times if fidelity flags issues
      let generationResult;
      let fidelityResult = { passed: true, fidelity_score: 95, violations: [] as string[], notes: "" };
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        generationResult = await imageProvider.generateSceneImage(sp.image_prompt, {
          aspectRatio: sp.aspect_ratio as any,
          referenceImageBase64: referenceBase64,
          negativePrompt: sp.negative_prompt,
        });

        // Run automated Fidelity Check
        fidelityResult = await evaluateProductFidelity({
          originalImageBase64: referenceBase64,
          generatedImageBase64: generationResult.imageUrl,
          doNotChangeList: analysisObj.do_not_change,
          productName: analysisObj.product_name,
        }, (orig, gen, rules) => visionProvider.checkFidelity(orig, gen, rules));

        if (fidelityResult.passed || retries === maxRetries) {
          break;
        }
        retries++;
      }

      // Save Scene to DB
      const sceneRecord = await prisma.scene.create({
        data: {
          projectId,
          sceneNumber: i + 1,
          templateId: sp.template_id,
          sceneName: sp.scene_name,
          sceneNameAr: sp.scene_name_ar || sp.scene_name,
          imagePrompt: sp.image_prompt,
          negativePrompt: sp.negative_prompt,
          aspectRatio: sp.aspect_ratio,
          videoPrompt: sp.video_prompt,
          cameraMotion: sp.camera_motion,
          durationSeconds: sp.duration_seconds,
          motionNotes: sp.motion_notes,
          captionLine: sp.caption_line,
          voiceoverLine: sp.voiceover_line,
          status: "COMPLETED",
          activeImageUrl: generationResult!.imageUrl,
        },
      });

      // Save Generation record
      await prisma.generation.create({
        data: {
          sceneId: sceneRecord.id,
          imageUrl: generationResult!.imageUrl,
          promptUsed: sp.image_prompt,
          negativePrompt: sp.negative_prompt,
          videoPrompt: sp.video_prompt,
          fidelityScore: fidelityResult.fidelity_score,
          fidelityNotes: fidelityResult.notes,
          fidelityPassed: fidelityResult.passed,
          retryCount: retries,
          status: "COMPLETED",
        },
      });

      createdScenes.push({
        ...sceneRecord,
        imageUrl: generationResult!.imageUrl,
        fidelityScore: fidelityResult.fidelity_score,
        retries,
      });
    }

    // Mark job & project complete
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        progress: 100,
        currentStep: "Generation complete! Ready for review & export.",
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      scenes: createdScenes,
    });
  } catch (err: any) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate scenes" }, { status: 500 });
  }
}
