import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const format = searchParams.get("format") || "json";

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        analysis: true,
        scenes: {
          where: { selectedForExport: true },
          orderBy: { sceneNumber: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // JSON Export
    if (format === "json") {
      const storyboardPack = {
        title: project.name,
        targetMarket: project.targetMarket,
        platform: project.platform,
        tone: project.tone,
        product: {
          name: project.analysis?.productName,
          category: project.analysis?.category,
          materials: project.analysis?.materials,
          doNotChange: project.analysis?.doNotChange ? JSON.parse(project.analysis.doNotChange) : [],
        },
        scenesCount: project.scenes.length,
        scenes: project.scenes.map((s) => ({
          sceneNumber: s.sceneNumber,
          sceneName: s.sceneName,
          sceneNameAr: s.sceneNameAr,
          aspectRatio: s.aspectRatio,
          imageUrl: s.activeImageUrl,
          imagePrompt: s.imagePrompt,
          videoPrompt: s.videoPrompt,
          cameraMotion: s.cameraMotion,
          durationSeconds: s.durationSeconds,
          motionNotes: s.motionNotes,
          captionLine: s.captionLine,
          voiceoverLine: s.voiceoverLine,
        })),
        exportedAt: new Date().toISOString(),
        engine: "AdScene Studio Pro v1.0",
      };

      return new NextResponse(JSON.stringify(storyboardPack, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="storyboard-${project.name.toLowerCase().replace(/\s+/g, "-")}.json"`,
        },
      });
    }

    // ZIP Export
    if (format === "zip") {
      const zip = new JSZip();
      const folderName = `adscene-${project.name.toLowerCase().replace(/\s+/g, "-")}`;
      const rootFolder = zip.folder(folderName) || zip;

      for (const scene of project.scenes) {
        if (!scene.activeImageUrl) continue;
        const aspectFolder = rootFolder.folder(scene.aspectRatio.replace(":", "x")) || rootFolder;
        
        let fileBuffer: Buffer | null = null;
        let ext = "png";

        if (scene.activeImageUrl.startsWith("/uploads/") || scene.activeImageUrl.startsWith("/demo/")) {
          const filePath = path.join(process.cwd(), "public", scene.activeImageUrl);
          try {
            fileBuffer = await fs.readFile(filePath);
            ext = path.extname(scene.activeImageUrl).replace(".", "") || "png";
          } catch (e) {
            console.warn("Could not read image file for zip:", filePath, e);
          }
        }

        if (fileBuffer) {
          aspectFolder.file(`scene_${scene.sceneNumber}_${scene.templateId}.${ext}`, fileBuffer);
        }
      }

      // Add readme with video prompts into ZIP
      const promptManifest = project.scenes.map((s) => 
        `--- SCENE ${s.sceneNumber}: ${s.sceneName} (${s.aspectRatio}) ---\n` +
        `IMAGE PROMPT:\n${s.imagePrompt}\n\n` +
        `VIDEO PROMPT (For Veo / Runway / Kling / Luma / Sora):\n${s.videoPrompt}\n\n` +
        `CAMERA MOTION: ${s.cameraMotion} | DURATION: ${s.durationSeconds}s\n` +
        `CAPTION: ${s.captionLine || "N/A"}\nVOICEOVER: ${s.voiceoverLine || "N/A"}\n\n`
      ).join("\n");

      rootFolder.file("VIDEO_PROMPTS_AND_STORYBOARD.txt", promptManifest);

      const zipContent = await zip.generateAsync({ type: "uint8array" });

      return new NextResponse(zipContent as any, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${folderName}.zip"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (err: any) {
    console.error("Export error:", err);
    return NextResponse.json({ error: err.message || "Export failed" }, { status: 500 });
  }
}
