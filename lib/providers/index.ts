import { IVisionProvider, IImageProvider, IStorageProvider } from "./types";
import { GeminiVisionProvider, OpenAIVisionProvider, MockVisionProvider } from "./vision-provider";
import { GeminiImageProvider, OpenAIImageProvider, ReplicateFluxProvider, MockImageProvider } from "./image-provider";
import { getStorageProvider } from "./storage-provider";

export function getVisionProvider(): IVisionProvider {
  const chosen = (process.env.VISION_PROVIDER || "gemini").toLowerCase();

  if (chosen === "gemini" && process.env.GEMINI_API_KEY) {
    return new GeminiVisionProvider();
  }
  if (chosen === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAIVisionProvider();
  }
  // If neither key is present, use intelligent MockVisionProvider so app never crashes
  return new MockVisionProvider();
}

export function getImageProvider(apiKey?: string): IImageProvider {
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    return new GeminiImageProvider(geminiKey);
  }

  const chosen = (process.env.IMAGE_PROVIDER || "gemini").toLowerCase();

  if (chosen === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAIImageProvider();
  }
  if (chosen === "replicate" && process.env.REPLICATE_API_TOKEN) {
    return new ReplicateFluxProvider();
  }

  // Fallback to studio mock image engine if no key is supplied yet
  return new MockImageProvider();
}

export { getStorageProvider };
export * from "./types";
