import { ProductAnalysis, BriefFormData, ScenePrompt } from "./types";
import { SceneTemplate, selectBestScenesForProduct } from "./scene-library";

export interface PromptBuildParams {
  analysis: ProductAnalysis;
  brief: BriefFormData;
  template: SceneTemplate;
  aspectRatio?: "9:16" | "1:1" | "4:5" | "16:9";
  language?: "ar" | "en";
}

/**
 * Builds photorealistic image and cinematic video prompts with guaranteed product fidelity rules.
 */
export function buildScenePrompt(params: PromptBuildParams): ScenePrompt {
  const { analysis, brief, template, aspectRatio = "9:16", language = "ar" } = params;

  // Strict Product Fidelity Directives
  const doNotChangeRules = (analysis.do_not_change || [])
    .map((rule) => `MUST PRESERVE EXACT: ${rule}`)
    .join(", ");

  const productSubject = `Official commercial centerpiece of the exact product: "${analysis.product_name}" (${analysis.category}). Materials: ${analysis.materials}. Silhouette: ${analysis.shape}. Colors and finishes: ${analysis.colors}. Visible details: ${analysis.key_features}.`;

  // Market & Cultural Aesthetics
  let culturalAtmosphere = "";
  if (brief.targetMarket.includes("MENA") || brief.targetMarket.includes("Egypt") || brief.targetMarket.includes("GCC")) {
    culturalAtmosphere = "modern contemporary Middle-Eastern and Arabian luxury aesthetics, tasteful warm architectural finishes, travertine, warm ambient lighting";
  } else if (brief.targetMarket.includes("USA") || brief.targetMarket.includes("Europe")) {
    culturalAtmosphere = "sleek Western high-end commercial aesthetic, clean modern minimalism, architectural natural lighting";
  } else if (brief.targetMarket.includes("Asia")) {
    culturalAtmosphere = "refined East Asian modern premium aesthetic, balanced wabi-sabi minimalism, soft diffuse lighting";
  }

  // Model inclusion directive
  let modelDirective = "";
  if (brief.modelType === "hands") {
    modelDirective = "Featuring elegant, manicured human hands naturally holding or interacting with the product without obscuring the front label.";
  } else if (brief.modelType === "full") {
    modelDirective = `Featuring a professional commercial model in the background (${brief.modelDescription || "sophisticated demographic matching target audience"}), tastefully complementing the product without overpowering it.`;
  } else {
    modelDirective = "No human figures or faces, isolated product focus.";
  }

  // Tone adjustments
  const toneDirectives: Record<string, string> = {
    Luxury: "opulent, high-end, premium metallic reflections, deep depth, prestige advertising campaign look",
    Minimal: "ultra-clean, serene negative space, pure geometric simplicity, editorial aesthetic",
    Energetic: "vibrant, dynamic, punchy high contrast, bold shadows, energetic commercial feel",
    "Cozy/Lifestyle": "warm, welcoming, soft natural ambient glow, authentic lifestyle warmth",
    "Tech/Futuristic": "sleek, titanium, neon cyan or deep violet edge luminescence, cutting-edge engineering look",
    "Natural/Organic": "botanical accents, unpolished limestone, soft sun-dappled shadows, earthy organic purity",
    "Bold/Pop": "saturated graphic color blocking, crisp studio shadows, eye-catching social media hero shot",
  };
  const toneNote = toneDirectives[brief.tone] || "polished high-end commercial advertising";

  // Construct complete Master Image Prompt
  const image_prompt = [
    `Photorealistic commercial advertising photography of the exact product shown in reference photo.`,
    productSubject,
    `Scene: ${template.basePromptModifier}.`,
    culturalAtmosphere ? `Atmosphere: ${culturalAtmosphere}.` : "",
    `Tone: ${toneNote}.`,
    modelDirective,
    brief.brandColors ? `Accent brand colors: ${brief.brandColors}.` : "",
    `CRITICAL FIDELITY DIRECTIVE: Maintain exact original product geometry, proportions, labels, and text unaltered. ${doNotChangeRules}`,
    `Camera & Quality: 8k resolution, Hasselblad H6D-100c, razor sharp focus on product brand text, cinematic studio lighting, commercial grade color grading, masterwork, no distorted text, no extra products, no watermark.`
  ].filter(Boolean).join(" ");

  // Negative Prompt
  const negative_prompt = [
    "distorted product, morphed logo, blurry brand text, altered bottle shape, extra caps, wrong proportions, duplicated items, extra products, low resolution, grain, digital artifacts, oversaturated chromatic aberration, deformed hands, extra fingers, cartoonish, 3d render plastic sheen, amateur photography, watermarks, stamps, unwanted text overlays, blurry edges",
    template.negativePromptAdditions
  ].filter(Boolean).join(", ");

  // Master Image-to-Video Prompt (strictly motions, no morphing)
  const video_prompt = [
    `Image-to-video motion starting from this exact still frame.`,
    `Camera motion: ${template.defaultMotion}.`,
    `Lighting & Ambience: subtle cinematic light play glides across the product surface; soft organic ambient particles float gently in the deep background.`,
    `STRICT MOTION SAFETY: The central product "${analysis.product_name}" must remain completely solid, rigid, and undeformed throughout the entire clip. No morphing, no shape shifting, no text alterations, no glitching. Smooth fluid movement at 24fps.`
  ].join(" ");

  // Motion Notes
  const motion_notes = `Dynamic elements: camera trajectory (${template.defaultMotion}), background lighting shimmer and particles. Completely static: product physical silhouette, label, and typography.`;

  // Dynamic Caption & Voiceover Lines
  let caption_line = "";
  let voiceover_line = "";

  if (language === "ar") {
    const slogansAr: Record<string, string> = {
      Luxury: `ارتقِ بتجربتك مع فخامة ${analysis.product_name} الاستثنائية.`,
      Minimal: `البساطة في أبهى صورها. اكتشف ${analysis.product_name}.`,
      Energetic: `انطلق بقوة وثقة لا حدود لها مع ${analysis.product_name}.`,
      "Cozy/Lifestyle": `لحظاتك اليومية تصبح أجمل مع ${analysis.product_name}.`,
      "Tech/Futuristic": `مستقبل الابتكار بين يديك الآن.`,
      "Natural/Organic": `نقاء الطبيعة المتكامل في ${analysis.product_name}.`,
      "Bold/Pop": `تميز بإطلالة تخطف الأنظار مع ${analysis.product_name}.`,
    };
    caption_line = brief.slogan || slogansAr[brief.tone] || `اكتشف التميز الحقيقي مع ${analysis.product_name}.`;
    voiceover_line = `عندما تجتمع الدقة مع الأناقة، يولد ${analysis.product_name}. متوفر الآن.`;
  } else {
    const slogansEn: Record<string, string> = {
      Luxury: `Elevate your lifestyle with the supreme craftsmanship of ${analysis.product_name}.`,
      Minimal: `Pure sophistication. Discover ${analysis.product_name}.`,
      Energetic: `Unleash your full potential with ${analysis.product_name}.`,
      "Cozy/Lifestyle": `Everyday luxury made for you.`,
      "Tech/Futuristic": `Engineered for what's next.`,
      "Natural/Organic": `Pure, authentic, and naturally radiant.`,
      "Bold/Pop": `Make an unforgettable statement with ${analysis.product_name}.`,
    };
    caption_line = brief.slogan || slogansEn[brief.tone] || `Experience perfection with ${analysis.product_name}.`;
    voiceover_line = `Engineered for excellence. Experience the new ${analysis.product_name} today.`;
  }

  return {
    scene_name: template.name,
    scene_name_ar: template.nameAr,
    template_id: template.id,
    image_prompt,
    negative_prompt,
    aspect_ratio: aspectRatio,
    video_prompt,
    camera_motion: template.defaultMotion,
    duration_seconds: template.defaultDuration,
    motion_notes,
    caption_line,
    voiceover_line,
  };
}

export function generateAllScenePrompts(
  analysis: ProductAnalysis,
  brief: BriefFormData,
  language: "ar" | "en" = "ar"
): ScenePrompt[] {
  const chosenTemplates = selectBestScenesForProduct(analysis.category, brief.sceneCount);
  const primaryAspect = (brief.aspectRatios && brief.aspectRatios[0] as "9:16" | "1:1" | "4:5" | "16:9") || "9:16";

  return chosenTemplates.map((template) =>
    buildScenePrompt({
      analysis,
      brief,
      template,
      aspectRatio: primaryAspect,
      language,
    })
  );
}
