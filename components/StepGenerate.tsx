"use client";

import Image from "next/image";
import { CheckCircle2, ShieldCheck, Film } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface GeneratedScene {
  id: string;
  sceneNumber: number;
  templateId: string;
  sceneName: string;
  sceneNameAr?: string;
  aspectRatio: string;
  activeImageUrl?: string;
  imageUrl?: string;
  fidelityScore?: number;
  videoPrompt: string;
}

interface StepGenerateProps {
  progress: number;
  currentStepMessage: string;
  scenes: GeneratedScene[];
  targetCount: number;
  isComplete: boolean;
  onProceedToExport: () => void;
}

export default function StepGenerate({
  progress,
  currentStepMessage,
  scenes,
  targetCount,
  isComplete,
  onProceedToExport,
}: StepGenerateProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      {/* Progress Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 mb-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
          {isComplete ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          {isComplete ? (lang === "ar" ? "اكتمل توليد جميع المشاهد الإعلانية!" : "All Scenes Generated Successfully!") : t.generatingTitle}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mb-6">
          {isComplete ? (lang === "ar" ? "تم التحقق من مطابقة المنتج بنجاح وجاهز للمعاينة والتصدير السينمائي" : "Verified product fidelity and generated ready-to-use image-to-video motion prompts.") : currentStepMessage || t.generatingSubtitle}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>{t.overallProgress}</span>
            <span className="text-emerald-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 mt-1">
            <span>{t.scenesFinished}: {scenes.length} / {targetCount}</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.fidelityVerified}
            </span>
          </div>
        </div>

        {isComplete && (
          <button
            onClick={onProceedToExport}
            className="mt-6 py-3 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition animate-bounce"
          >
            {lang === "ar" ? "فتح معرض المشاهد وأدوات الاستوديو" : "Open Studio Gallery & Export"}
          </button>
        )}
      </div>

      {/* Grid of Scenes (Real-time filling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: targetCount }).map((_, idx) => {
          const scene = scenes[idx];

          if (scene) {
            return (
              <div
                key={scene.id || idx}
                className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-900/70 border border-white/10 hover:border-emerald-500/50 shadow-xl transition-all duration-300 animate-fadeIn"
              >
                {/* Image container */}
                <div className="relative aspect-[9/16] bg-black/60 overflow-hidden">
                  <Image
                    src={scene.activeImageUrl || scene.imageUrl || "/demo/perfume.svg"}
                    alt={scene.sceneName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                    Scene #{scene.sceneNumber}
                  </div>
                  {scene.fidelityScore && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-md text-[10px] font-semibold text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{scene.fidelityScore}%</span>
                    </div>
                  )}
                </div>

                {/* Info bar */}
                <div className="p-3.5 flex flex-col gap-1.5 bg-zinc-950/90">
                  <h4 className="text-xs font-bold text-white truncate">
                    {lang === "ar" && scene.sceneNameAr ? scene.sceneNameAr : scene.sceneName}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Film className="w-3 h-3 text-emerald-400" />
                    <span className="truncate">{lang === "ar" ? "أمر فيديو جاهز" : "Video prompt ready"}</span>
                  </div>
                </div>
              </div>
            );
          }

          // Skeleton Loader
          return (
            <div
              key={idx}
              className="flex flex-col rounded-2xl overflow-hidden bg-zinc-950/40 border border-zinc-800/80 shadow-md animate-pulse"
            >
              <div className="relative aspect-[9/16] bg-zinc-900/60 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-emerald-500 animate-spin" />
                <span className="absolute bottom-3 text-[10px] font-mono text-zinc-500">
                  {lang === "ar" ? `قيد التوليد... (#${idx + 1})` : `Generating Scene #${idx + 1}...`}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-zinc-950">
                <div className="h-3 w-3/4 rounded bg-zinc-800" />
                <div className="h-2 w-1/2 rounded bg-zinc-800/60" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
