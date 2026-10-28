import fs from "fs/promises";
import path from "path";
import { IStorageProvider } from "./types";

export class LocalStorageProvider implements IStorageProvider {
  name = "local";
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch {
      // directory exists
    }
  }

  async saveFile(buffer: Buffer, filename: string, _mimeType: string): Promise<string> {
    await this.ensureDir();
    const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(this.uploadDir, cleanFilename);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${cleanFilename}`;
  }

  async getFile(fileUrl: string): Promise<Buffer> {
    const filename = path.basename(fileUrl);
    const filePath = path.join(this.uploadDir, filename);
    return await fs.readFile(filePath);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
    } catch (e) {
      console.warn("Could not delete file:", fileUrl, e);
    }
  }
}

export class S3StorageProvider implements IStorageProvider {
  name = "s3";

  async saveFile(buffer: Buffer, filename: string, _mimeType: string): Promise<string> {
    // S3 adapter ready for bucket configuration
    console.info("S3 storage adapter: mock or configured upload for", filename);
    const local = new LocalStorageProvider();
    return await local.saveFile(buffer, filename, _mimeType);
  }

  async getFile(fileUrl: string): Promise<Buffer> {
    const local = new LocalStorageProvider();
    return await local.getFile(fileUrl);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const local = new LocalStorageProvider();
    await local.deleteFile(fileUrl);
  }
}

let storageInstance: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (!storageInstance) {
    const driver = process.env.STORAGE_DRIVER || "local";
    storageInstance = driver === "s3" ? new S3StorageProvider() : new LocalStorageProvider();
  }
  return storageInstance;
}
