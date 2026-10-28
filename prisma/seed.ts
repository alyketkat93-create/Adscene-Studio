import { PrismaClient } from "@prisma/client";
import { SCENE_LIBRARY } from "../lib/scene-library";
import { buildScenePrompt } from "../lib/prompt-builder";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo project for AdScene Studio...");

  const existing = await prisma.project.findFirst({
    where: { name: "Oud Royale Extrait de Parfum" },
  });

  if (existing) {
    console.log("Seed project already exists.");
    return;
  }

  const project = await prisma.project.create({
    data: {
      name: "Oud Royale Extrait de Parfum",
      status: "COMPLETED",
      targetMarket: "GCC",
      platform: "Instagram Reels/Stories",
      aspectRatios: "9:16",
      tone: "Luxury",
      modelType: "none",
      sceneCount: 4,
      brandColors: "#D4AF37, #0A0A0A",
      slogan: "A Symphony of Smoked Obsidian and 24K Liquid Gold",
      extraNotes: "Focus on dramatic rim lighting and authentic Arabian luxury textures",
    },
  });

  await prisma.asset.create({
    data: {
      projectId: project.id,
      type: "ORIGINAL",
      url: "/demo/perfume.svg",
      filename: "perfume.svg",
      mimeType: "image/svg+xml",
      width: 1024,
      height: 1024,
      size: 24000,
    },
  });

  const analysisData = {
    product_name: "Oud Royale Extrait de Parfum",
    category: "Luxury Perfume & Fragrances",
    materials: "Smoked heavy crystal glass, gold electroplated zamac cap, embossed label paper",
    colors: "Smoky obsidian black, burnished 24k gold, amber golden nectar",
    shape: "Stately geometric rectangular flacon with bevelled facets and cylindrical cap",
    key_features: "Gold spray atomizer, debossed Arabic calligraphy logo, heavy glass base with bubble gradient",
    brand_text_visible: "OUD ROYALE - EXTRAIT DE PARFUM 100ML",
    target_audience: "Affluent fragrance connoisseurs, GCC collectors, modern tastemakers",
    price_tier: "Ultra-Luxury" as const,
    suggested_markets: ["GCC", "Egypt/MENA", "Europe"],
    suggested_angles: ["Front eye-level hero", "Low-angle 30° majestic silhouette"],
    do_not_change: [
      "Smoked rectangular crystal bottle geometry and proportions",
      "Brushed gold cap shape and crown knurling",
      "Debossed front calligraphy label typography and spacing",
      "Deep amber warm hue of the internal liquid",
    ],
  };

  await prisma.analysis.create({
    data: {
      projectId: project.id,
      productName: analysisData.product_name,
      category: analysisData.category,
      materials: analysisData.materials,
      colors: analysisData.colors,
      shape: analysisData.shape,
      keyFeatures: analysisData.key_features,
      brandTextVisible: analysisData.brand_text_visible,
      targetAudience: analysisData.target_audience,
      priceTier: analysisData.price_tier,
      suggestedMarkets: JSON.stringify(analysisData.suggested_markets),
      suggestedAngles: JSON.stringify(analysisData.suggested_angles),
      doNotChange: JSON.stringify(analysisData.do_not_change),
      rawResponse: JSON.stringify(analysisData),
    },
  });

  // Pick 4 templates
  const templates = [
    SCENE_LIBRARY[1], // luxury dark premium
    SCENE_LIBRARY[0], // clean studio hero
    SCENE_LIBRARY[4], // dynamic splash / levitation
    SCENE_LIBRARY[9], // seasonal promotional (Ramadan/Eid)
  ];

  for (let i = 0; i < templates.length; i++) {
    const tmpl = templates[i];
    const promptObj = buildScenePrompt({
      analysis: analysisData,
      brief: {
        targetMarket: "GCC",
        platform: "Instagram Reels/Stories",
        aspectRatios: ["9:16"],
        tone: "Luxury",
        modelType: "none",
        sceneCount: 4,
        brandColors: "#D4AF37",
        slogan: "A Symphony of Smoked Obsidian and 24K Liquid Gold",
      },
      template: tmpl,
      aspectRatio: "9:16",
      language: "ar",
    });

    const scene = await prisma.scene.create({
      data: {
        projectId: project.id,
        sceneNumber: i + 1,
        templateId: tmpl.id,
        sceneName: tmpl.name,
        sceneNameAr: tmpl.nameAr,
        imagePrompt: promptObj.image_prompt,
        negativePrompt: promptObj.negative_prompt,
        aspectRatio: "9:16",
        videoPrompt: promptObj.video_prompt,
        cameraMotion: promptObj.camera_motion,
        durationSeconds: promptObj.duration_seconds,
        motionNotes: promptObj.motion_notes,
        captionLine: promptObj.caption_line,
        voiceoverLine: promptObj.voiceover_line,
        status: "COMPLETED",
        activeImageUrl: "/demo/perfume.svg",
        selectedForExport: true,
      },
    });

    await prisma.generation.create({
      data: {
        sceneId: scene.id,
        imageUrl: "/demo/perfume.svg",
        promptUsed: promptObj.image_prompt,
        negativePrompt: promptObj.negative_prompt,
        videoPrompt: promptObj.video_prompt,
        fidelityScore: 98,
        fidelityNotes: "Reference geometry, typography, and cap finish matched with 98% fidelity.",
        fidelityPassed: true,
        retryCount: 0,
        status: "COMPLETED",
      },
    });
  }

  console.log("Demo project seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
