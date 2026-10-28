import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { IVisionProvider } from "./types";
import { ProductAnalysis, ProductAnalysisSchema, FidelityCheckResult, FidelityCheckResultSchema, ScenePrompt } from "../types";

export class GeminiVisionProvider implements IVisionProvider {
  name = "gemini";
  private client: GoogleGenerativeAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY || "";
    this.client = new GoogleGenerativeAI(key);
  }

  async analyzeProduct(imageBase64: string, mimeType: string): Promise<ProductAnalysis> {
    const model = this.client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are a world-class advertising creative director and computer vision specialist.
Analyze this product photo in extreme commercial detail.
Return a valid JSON object matching this schema:
{
  "product_name": "clean commercial name or likely title",
  "category": "e.g., Perfume & Fragrances, Luxury Skincare, Smartwatch, Footwear, Electronics",
  "materials": "precise visible textures and finishes (e.g. frosted amber glass, matte black polymer, brushed titanium, gold foil)",
  "colors": "exact color palette and accents (e.g. deep emerald green, polished gold, matte charcoal)",
  "shape": "geometric silhouette and form factor",
  "key_features": "distinctive details, spray nozzle, chamfered edges, dial markings, packaging seams",
  "brand_text_visible": "exact typography, logos, or visible brand text (or 'None' if unbranded)",
  "target_audience": "ideal demographic and psychographic buyers",
  "price_tier": "Budget" | "Mid-range" | "Premium" | "Ultra-Luxury",
  "suggested_markets": ["Egypt/MENA", "GCC", "USA", "Europe"],
  "suggested_angles": ["front hero at eye level", "slight 45-degree angle", "top-down flat-lay"],
  "do_not_change": [
    "exact bottle geometry and proportions",
    "gold cap shape and metallic sheen",
    "embossed front typography and logo alignment",
    "liquid color and transparency"
  ]
}
Be precise, commercial, and realistic.`;

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/jpeg",
        },
      },
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return ProductAnalysisSchema.parse(parsed);
  }

  async checkFidelity(
    originalImageBase64: string,
    generatedImageBase64: string,
    doNotChangeList: string[]
  ): Promise<FidelityCheckResult> {
    const model = this.client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Compare Image 1 (original product reference) with Image 2 (generated advertisement scene).
Evaluate whether the product in Image 2 is faithfully identical to Image 1.
Check:
1. Product shape, proportions, and contours.
2. Logos, typography, or branding elements.
3. Colors and materials.
4. Adherence to these strict rules: ${JSON.stringify(doNotChangeList)}.

Return a JSON object:
{
  "passed": boolean (true if fidelity score >= 80 and no critical distortions),
  "fidelity_score": number (0 to 100),
  "violations": ["list of specific visual discrepancies if any"],
  "notes": "brief summary of how faithfully the product was rendered",
  "recommended_fix": "optional prompt or compositing adjustment"
}`;

    const cleanOrig = originalImageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const cleanGen = generatedImageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: cleanOrig, mimeType: "image/jpeg" } },
      { inlineData: { data: cleanGen, mimeType: "image/jpeg" } },
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return FidelityCheckResultSchema.parse(parsed);
  }

  async refineScenePrompt(currentPrompt: ScenePrompt, editInstruction: string): Promise<ScenePrompt> {
    const model = this.client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are an expert prompt engineer for advertising visuals.
Modify the following scene prompt object according to this user instruction: "${editInstruction}".
Current scene prompt object:
${JSON.stringify(currentPrompt, null, 2)}

Return the updated ScenePrompt object preserving all keys and maintaining absolute product fidelity.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  }
}

export class OpenAIVisionProvider implements IVisionProvider {
  name = "openai";
  private openai: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY || "";
    this.openai = new OpenAI({ apiKey: key });
  }

  async analyzeProduct(imageBase64: string, _mimeType: string): Promise<ProductAnalysis> {
    const formattedUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an advertising vision expert. Analyze the product and return JSON matching ProductAnalysisSchema.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this commercial product for advertising scene generation." },
            { type: "image_url", image_url: { url: formattedUrl, detail: "high" } },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return ProductAnalysisSchema.parse(parsed);
  }

  async checkFidelity(
    originalImageBase64: string,
    generatedImageBase64: string,
    doNotChangeList: string[]
  ): Promise<FidelityCheckResult> {
    const origUrl = originalImageBase64.startsWith("data:") ? originalImageBase64 : `data:image/jpeg;base64,${originalImageBase64}`;
    const genUrl = generatedImageBase64.startsWith("data:") ? generatedImageBase64 : `data:image/jpeg;base64,${generatedImageBase64}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Compare the original product with the generated scene. Output JSON matching FidelityCheckResultSchema.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Compare fidelity based on rules: ${JSON.stringify(doNotChangeList)}` },
            { type: "image_url", image_url: { url: origUrl } },
            { type: "image_url", image_url: { url: genUrl } },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return FidelityCheckResultSchema.parse(parsed);
  }

  async refineScenePrompt(currentPrompt: ScenePrompt, editInstruction: string): Promise<ScenePrompt> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Modify the given scene prompt object according to user instruction while ensuring product fidelity.",
        },
        {
          role: "user",
          content: `Instruction: "${editInstruction}".\nCurrent: ${JSON.stringify(currentPrompt)}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  }
}

export class MockVisionProvider implements IVisionProvider {
  name = "mock";

  async analyzeProduct(_imageBase64: string, _mimeType: string): Promise<ProductAnalysis> {
    return {
      product_name: "Oud Royale Extrait de Parfum",
      category: "Luxury Perfume & Fragrances",
      materials: "Heavy smoked crystal glass, gold electroplated zamac cap, embossed label paper",
      colors: "Smoky obsidian black, burnished 24k gold, amber golden nectar",
      shape: "Stately geometric rectangular flacon with bevelled shoulder facets and cylindrical magnetic cap",
      key_features: "Metallic gold spray atomizer, debossed Arabic calligraphy logo, heavy glass base with bubble gradient",
      brand_text_visible: "OUD ROYALE - EXTRAIT DE PARFUM 100ML",
      target_audience: "Affluent connoisseurs, GCC & international luxury fragrance collectors, modern tastemakers",
      price_tier: "Ultra-Luxury",
      suggested_markets: ["GCC", "Egypt/MENA", "Europe", "USA"],
      suggested_angles: ["Front eye-level hero", "Low-angle 30° majestic silhouette", "Overhead flat-lay"],
      do_not_change: [
        "Smoked rectangular crystal bottle geometry and proportions",
        "Brushed gold cap shape and crown knurling",
        "Debossed front calligraphy label typography and spacing",
        "Deep amber warm hue of the internal liquid"
      ],
    };
  }

  async checkFidelity(
    _originalImageBase64: string,
    _generatedImageBase64: string,
    _doNotChangeList: string[]
  ): Promise<FidelityCheckResult> {
    return {
      passed: true,
      fidelity_score: 96,
      violations: [],
      notes: "Product geometry, golden cap, typography, and liquid amber hues match reference with 96% confidence.",
    };
  }

  async refineScenePrompt(currentPrompt: ScenePrompt, editInstruction: string): Promise<ScenePrompt> {
    return {
      ...currentPrompt,
      image_prompt: `${currentPrompt.image_prompt}. Modified with directive: ${editInstruction}`,
    };
  }
}
