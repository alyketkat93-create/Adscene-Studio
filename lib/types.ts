import { z } from "zod";

export const ProductAnalysisSchema = z.object({
  product_name: z.string().describe("The clean, commercial name of the product"),
  category: z.string().describe("E.g., Perfume & Fragrances, Skincare, Watches, Electronics, Footwear"),
  materials: z.string().describe("Primary visible materials (e.g., frosted glass, gold brushed metal, leather)"),
  colors: z.string().describe("Prominent colors and finishes"),
  shape: z.string().describe("Physical silhouette and geometry"),
  key_features: z.string().describe("Distinctive design elements, caps, nozzles, logos, buttons"),
  brand_text_visible: z.string().describe("Visible text, typography, or logo placement on the item"),
  target_audience: z.string().describe("Demographic or psychographic profile most suited for this product"),
  price_tier: z.enum(["Budget", "Mid-range", "Premium", "Ultra-Luxury"]).default("Premium"),
  suggested_markets: z.array(z.string()).describe("Best markets, e.g. GCC, Egypt/MENA, USA, Europe"),
  suggested_angles: z.array(z.string()).describe("Best camera angles for this product form"),
  do_not_change: z.array(z.string()).describe("Strict list of visual traits that MUST NOT mutate or distort"),
});

export type ProductAnalysis = z.infer<typeof ProductAnalysisSchema>;

export const ScenePromptSchema = z.object({
  scene_name: z.string(),
  scene_name_ar: z.string().optional(),
  template_id: z.string(),
  image_prompt: z.string().describe("Photorealistic commercial prompt describing environment, lighting, camera"),
  negative_prompt: z.string().describe("Artifacts and deformations to prevent"),
  aspect_ratio: z.enum(["9:16", "1:1", "4:5", "16:9"]).default("9:16"),
  video_prompt: z.string().describe("Pure motion prompt starting from this exact static scene"),
  camera_motion: z.string().describe("E.g. slow push-in, subtle 30-degree orbit, pedestal rise"),
  duration_seconds: z.number().int().min(3).max(8).default(4),
  motion_notes: z.string().describe("What elements animate and what must remain completely static"),
  caption_line: z.string().describe("Punchy ad copy line"),
  voiceover_line: z.string().describe("Narrator voiceover script line in target language"),
});

export type ScenePrompt = z.infer<typeof ScenePromptSchema>;

export const FidelityCheckResultSchema = z.object({
  passed: z.boolean(),
  fidelity_score: z.number().min(0).max(100),
  violations: z.array(z.string()),
  notes: z.string(),
  recommended_fix: z.string().optional(),
});

export type FidelityCheckResult = z.infer<typeof FidelityCheckResultSchema>;

export interface BriefFormData {
  targetMarket: string;
  platform: string;
  aspectRatios: string[];
  tone: string;
  modelType: "none" | "hands" | "full";
  modelDescription?: string;
  sceneCount: 4 | 8 | 12;
  brandColors?: string;
  slogan?: string;
  extraNotes?: string;
}
