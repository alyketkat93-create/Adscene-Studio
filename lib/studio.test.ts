import { describe, it, expect } from "vitest";
import { buildScenePrompt, generateAllScenePrompts } from "./prompt-builder";
import { SCENE_LIBRARY, selectBestScenesForProduct } from "./scene-library";
import { evaluateProductFidelity } from "./fidelity";
import { ProductAnalysis, BriefFormData } from "./types";

const mockAnalysis: ProductAnalysis = {
  product_name: "Oud Royale Extrait",
  category: "Perfume & Fragrances",
  materials: "Smoked glass, brushed gold cap",
  colors: "Obsidian black, 24k gold",
  shape: "Rectangular bevelled flacon",
  key_features: "Gold atomizer, Arabic debossed typography",
  brand_text_visible: "OUD ROYALE",
  target_audience: "Luxury fragrance buyers",
  price_tier: "Ultra-Luxury",
  suggested_markets: ["GCC", "Egypt/MENA"],
  suggested_angles: ["Front eye-level hero"],
  do_not_change: [
    "Rectangular flacon geometry",
    "Gold cap finish",
    "Arabic typography debossed on front",
  ],
};

const mockBrief: BriefFormData = {
  targetMarket: "GCC",
  platform: "Instagram Reels/Stories",
  aspectRatios: ["9:16"],
  tone: "Luxury",
  modelType: "none",
  sceneCount: 4,
  brandColors: "#D4AF37",
  slogan: "A touch of pure royalty",
};

describe("Scene Library & Selection", () => {
  it("should contain 12 distinct scene templates", () => {
    expect(SCENE_LIBRARY.length).toBe(12);
  });

  it("should select the best relevant scenes for perfume", () => {
    const scenes = selectBestScenesForProduct("Perfume & Fragrances", 4);
    expect(scenes.length).toBe(4);
    const ids = scenes.map((s) => s.id);
    expect(ids).toContain("luxury_dark_premium");
    expect(ids).toContain("clean_studio_hero");
  });
});

describe("Prompt Builder", () => {
  it("should generate a complete, valid ScenePrompt enforcing product fidelity", () => {
    const template = SCENE_LIBRARY[0];
    const result = buildScenePrompt({
      analysis: mockAnalysis,
      brief: mockBrief,
      template,
      aspectRatio: "9:16",
      language: "en",
    });

    expect(result.scene_name).toBe(template.name);
    expect(result.aspect_ratio).toBe("9:16");
    expect(result.duration_seconds).toBeGreaterThanOrEqual(3);
    expect(result.duration_seconds).toBeLessThanOrEqual(8);

    // Image prompt must contain fidelity rules
    expect(result.image_prompt).toContain("MUST PRESERVE EXACT: Rectangular flacon geometry");
    expect(result.image_prompt).toContain("MUST PRESERVE EXACT: Gold cap finish");
    expect(result.image_prompt).toContain("razor sharp focus");
    expect(result.image_prompt).toContain("no distorted text");

    // Video prompt must strictly preserve product shape (no morphing)
    expect(result.video_prompt).toContain("Image-to-video motion");
    expect(result.video_prompt).toContain("must remain completely solid, rigid, and undeformed");
    expect(result.video_prompt).toContain("No morphing");

    // Negative prompt
    expect(result.negative_prompt).toContain("distorted product");
    expect(result.negative_prompt).toContain("morphed logo");
  });

  it("should generate multiple scenes matching requested count", () => {
    const prompts = generateAllScenePrompts(mockAnalysis, mockBrief, "ar");
    expect(prompts.length).toBe(4);
    prompts.forEach((p) => {
      expect(p.image_prompt).toBeDefined();
      expect(p.video_prompt).toBeDefined();
      expect(p.caption_line).toBeDefined();
    });
  });
});

describe("Fidelity Check Logic", () => {
  it("should pass fidelity for valid output and calculate score", async () => {
    const result = await evaluateProductFidelity({
      originalImageBase64: "data:image/jpeg;base64,valid_original_image_bytes_string_mock_data_exceeding_threshold",
      generatedImageBase64: "data:image/jpeg;base64,valid_generated_scene_bytes_string_mock_data_exceeding_threshold_well_over_500_chars_so_it_passes_all_heuristics_properly",
      doNotChangeList: mockAnalysis.do_not_change,
      productName: mockAnalysis.product_name,
    });

    expect(result.passed).toBe(true);
    expect(result.fidelity_score).toBeGreaterThanOrEqual(80);
    expect(result.violations.length).toBe(0);
  });

  it("should flag invalid or empty output", async () => {
    const result = await evaluateProductFidelity({
      originalImageBase64: "data:image/jpeg;base64,data",
      generatedImageBase64: "",
      doNotChangeList: mockAnalysis.do_not_change,
      productName: mockAnalysis.product_name,
    });

    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });
});
