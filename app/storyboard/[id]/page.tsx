"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Printer, Download, ArrowLeft, Camera, Film, ShieldCheck } from "lucide-react";

export default function StoryboardPrintPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        const data = await res.json();
        setProject(data.project);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Generating Production Storyboard Pack...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <Link href="/" className="text-emerald-400 underline text-sm">
          Return to Studio
        </Link>
      </div>
    );
  }

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 p-6 sm:p-12 print:bg-white print:text-black print:p-0">
      {/* Top Floating Action Bar (Hidden on print) */}
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800 print:hidden">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href={`/api/export?projectId=${project.id}&format=json`}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </a>

          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Storyboard Document */}
      <div className="max-w-5xl mx-auto flex flex-col gap-8 print:max-w-none">
        {/* Document Header */}
        <div className="border-b border-zinc-800 pb-6 print:border-black">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 print:text-black">
              ADSCENE STUDIO • MASTER STORYBOARD PRODUCTION PACK
            </span>
            <span className="text-xs text-zinc-400 print:text-zinc-600">
              {new Date().toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white print:text-black mt-2">
            {project.name}
          </h1>

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-zinc-300 print:text-zinc-700">
            <span>
              <strong>Target Market:</strong> {project.targetMarket || "MENA"}
            </span>
            <span>•</span>
            <span>
              <strong>Platform:</strong> {project.platform || "Instagram Reels"}
            </span>
            <span>•</span>
            <span>
              <strong>Tone:</strong> {project.tone || "Luxury"}
            </span>
            <span>•</span>
            <span>
              <strong>Scenes:</strong> {project.scenes.length}
            </span>
          </div>
        </div>

        {/* Product Identity Summary */}
        {project.analysis && (
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 print:bg-zinc-100 print:border-zinc-300">
            <h3 className="text-xs font-bold text-emerald-400 print:text-black flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Product Fidelity Specs</span>
            </h3>
            <p className="text-xs text-zinc-300 print:text-zinc-800">
              <strong>Category:</strong> {project.analysis.category} |{" "}
              <strong>Materials:</strong> {project.analysis.materials} |{" "}
              <strong>Shape:</strong> {project.analysis.shape}
            </p>
          </div>
        )}

        {/* Scene Cards */}
        <div className="flex flex-col gap-10">
          {project.scenes.map((scene: any) => (
            <div
              key={scene.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800 print:bg-white print:border-zinc-300 print:break-inside-avoid"
            >
              {/* Scene Visual */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative w-full aspect-[9/16] max-h-[380px] rounded-xl overflow-hidden border border-white/10 print:border-zinc-400 bg-black">
                  <Image
                    src={scene.activeImageUrl}
                    alt={scene.sceneName}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 print:text-black border border-white/10">
                    Scene #{scene.sceneNumber}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white print:text-black border border-white/10">
                    {scene.aspectRatio}
                  </div>
                </div>
              </div>

              {/* Scene Directives */}
              <div className="md:col-span-8 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 print:border-zinc-300">
                    <div>
                      <h2 className="text-base font-bold text-white print:text-black">
                        {scene.sceneName}
                      </h2>
                      {scene.sceneNameAr && (
                        <span className="text-xs text-zinc-400 print:text-zinc-600">
                          {scene.sceneNameAr}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 print:text-black">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{scene.cameraMotion}</span>
                      <span>({scene.durationSeconds}s)</span>
                    </div>
                  </div>

                  {/* Master Video Prompt */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-emerald-400 print:text-black flex items-center gap-1">
                      <Film className="w-3.5 h-3.5" />
                      <span>IMAGE-TO-VIDEO MOTION PROMPT (For Veo / Runway / Kling / Sora)</span>
                    </span>
                    <p className="text-xs font-mono bg-black/80 print:bg-zinc-100 p-3 rounded-xl border border-white/5 print:border-zinc-300 text-zinc-200 print:text-black leading-relaxed">
                      {scene.videoPrompt}
                    </p>
                  </div>

                  {/* Image Prompt */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-zinc-400 print:text-zinc-700">
                      COMMERCIAL STILL IMAGE PROMPT
                    </span>
                    <p className="text-xs text-zinc-300 print:text-zinc-800 line-clamp-3 leading-relaxed">
                      {scene.imagePrompt}
                    </p>
                  </div>
                </div>

                {/* Slogan & Voiceover */}
                {(scene.captionLine || scene.voiceoverLine) && (
                  <div className="p-3 rounded-xl bg-zinc-900/60 print:bg-zinc-100 border border-zinc-800 print:border-zinc-300 flex flex-col gap-1 text-xs">
                    {scene.captionLine && (
                      <p>
                        <strong className="text-amber-400 print:text-black">Caption:</strong>{" "}
                        "{scene.captionLine}"
                      </p>
                    )}
                    {scene.voiceoverLine && (
                      <p>
                        <strong className="text-emerald-400 print:text-black">Voiceover:</strong>{" "}
                        "{scene.voiceoverLine}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
