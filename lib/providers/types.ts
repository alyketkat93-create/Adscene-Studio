import { ProductAnalysis, FidelityCheckResult, ScenePrompt, BriefFormData } from "../types";

export interface IVisionProvider {
  name: string;
  analyzeProduct(imageBase64: string, mimeType: string): Promise<ProductAnalysis>;
  checkFidelity(
    originalImageBase64: string,
    generatedImageBase64: string,
    doNotChangeList: string[]
  ): Promise<FidelityCheckResult>;
  refineScenePrompt(
    currentPrompt: ScenePrompt,
    editInstruction: string
  ): Promise<ScenePrompt>;
}

export interface ImageGenerationOptions {
  aspectRatio?: "9:16" | "1:1" | "4:5" | "16:9";
  referenceImageBase64?: string;
  negativePrompt?: string;
  seed?: number;
}

export interface ImageGenerationResult {
  imageUrl: string; // URL or base64 data URI
  provider: string;
  metadata?: Record<string, any>;
}

export interface IImageProvider {
  name: string;
  generateSceneImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult>;
  editSceneImage(
    currentImageBase64: string,
    instruction: string,
    referenceImageBase64?: string
  ): Promise<ImageGenerationResult>;
  upscaleImage(imageBase64: string): Promise<ImageGenerationResult>;
}

export interface IStorageProvider {
  name: string;
  saveFile(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
  getFile(fileUrl: string): Promise<Buffer>;
  deleteFile(fileUrl: string): Promise<void>;
}
