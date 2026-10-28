"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  FileJson,
  Printer,
  Maximize2,
  X,
  Layers,
  Camera,
  Film,
  Send,
  Sliders,
  CheckSquare,
  Square,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";

export interface SceneItem {
  id: string;
  sceneNumber: number;
  templateId: string;
  sceneName: string;
  sceneNameAr?: string;
  aspectRatio: string;
  activeImageUrl: string;
  imagePrompt: string;
  negativePrompt?: string;
  videoPrompt: string;
  cameraMotion: string;
  durationSeconds: number;
  motionNotes?: string;
  captionLine?: string;
  voiceoverLine?: string;
  selectedForExport: boolean;
  generations?: Array<{
    id: string;
    imageUrl: string;
    fidelityScore?: number;
  }>;
}

interface StepExportProps {
  projectId: string;
  projectName: string;
  originalAssetUrl: string;
  scenes: SceneItem[];
  onUpdateScene: (updatedScene: SceneItem) => void;
}

export default function StepExport({
  projectId,
  originalAssetUrl,
  scenes,
  onUpdateScene,
}: StepExportProps) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [selectedScene, setSelectedScene] = useState<SceneItem | null>(null);
  const [filterAspect, setFilterAspect] = useState<string>("ALL");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSliderPos, setCompareSliderPos] = useState(50);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSceneAction = async (action: "regenerate" | "variation" | "edit" | "upscale") => {
    if (!selectedScene) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch("/api/scene/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.geminiApiKey ? { "x-gemini-key": user.geminiApiKey } : {}),
        },
        body: JSON.stringify({
          sceneId: selectedScene.id,
          action,
          instruction: editInstruction,
          geminiApiKey: user?.geminiApiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      const updated = {
        ...selectedScene,
        activeImageUrl: data.imageUrl,
        imagePrompt: data.scene?.imagePrompt || selectedScene.imagePrompt,
        videoPrompt: data.scene?.videoPrompt || selectedScene.videoPrompt,
      };
      setSelectedScene(updated);
      onUpdateScene(updated);
      setEditInstruction("");
    } catch (err: any) {
      alert(err.message || "Failed to execute action");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleToggleSelect = async (sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/scene/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId, action: "toggle_select" }),
      });
      const data = await res.json();
      if (res.ok) {
        const sc = scenes.find((s) => s.id === sceneId);
        if (sc) {
          onUpdateScene({ ...sc, selectedForExport: data.selectedForExport });
        }
      }
    } catch {
      // ignore
    }
  };

  const filteredScenes = scenes.filter((scene) => {
    if (filterAspect !== "ALL" && scene.aspectRatio !== filterAspect) return false;
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t.exportTitle}</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">{t.exportSubtitle}</p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download ZIP */}
          <a
            href={`/api/export?projectId=${projectId}&format=zip`}
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadAllZip}</span>
          </a>

          {/* Export Storyboard PDF / Printable */}
          <Link
            href={`/storyboard/${projectId}`}
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold text-xs transition"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{t.exportStoryboardPdf}</span>
          </Link>

          {/* Export JSON */}
          <a
            href={`/api/export?projectId=${projectId}&format=json`}
            download
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold text-xs transition"
          >
            <FileJson className="w-4 h-4 text-amber-400" />
            <span>{t.exportStoryboardJson}</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t.filterAspect}
          </span>
          {["ALL", "9:16", "1:1", "4:5", "16:9"].map((asp) => (
            <button
              key={asp}
              onClick={() => setFilterAspect(asp)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterAspect === asp
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-transparent"
              }`}
            >
              {asp === "ALL" ? t.filterAll : asp}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-zinc-500">
          {filteredScenes.length} {lang === "ar" ? "مشاهد معروضة" : "scenes shown"}
        </span>
      </div>

      {/* Grid of Scenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredScenes.map((scene) => (
          <div
            key={scene.id}
            onClick={() => {
              setSelectedScene(scene);
              setCompareMode(false);
            }}
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/60 shadow-xl transition-all duration-300 cursor-pointer"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-[9/16] bg-black/60 overflow-hidden">
              <Image
                src={scene.activeImageUrl}
                alt={scene.sceneName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Selection Checkbox */}
              <button
                type="button"
                onClick={(e) => handleToggleSelect(scene.id, e)}
                className="absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:border-emerald-400 transition"
              >
                {scene.selectedForExport ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {/* Aspect Ratio Badge */}
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10">
                {scene.aspectRatio}
              </div>

              {/* Hover Overlay with Inspect Icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xl">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === "ar" ? "معاينة وتحكم" : "Studio Inspect"}</span>
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="p-3.5 bg-zinc-950 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate">
                  {lang === "ar" && scene.sceneNameAr ? scene.sceneNameAr : scene.sceneName}
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">#{scene.sceneNumber}</span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1">{scene.cameraMotion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================================
          DETAILED SCENE STUDIO INSPECT MODAL (Side-by-side, prompts, actions)
          ===================================================================== */}
      {selectedScene && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-3xl bg-[#0b0d13] border border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  #{selectedScene.sceneNumber}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {lang === "ar" && selectedScene.sceneNameAr ? selectedScene.sceneNameAr : selectedScene.sceneName}
                  </h3>
                  <span className="text-xs text-zinc-400">{selectedScene.cameraMotion} • {selectedScene.durationSeconds}s</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    compareMode
                      ? "bg-emerald-500 text-black border-emerald-400"
                      : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t.compareWithOriginal}</span>
                </button>

                <button
                  onClick={() => setSelectedScene(null)}
                  className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Visual Showcase or Side-by-Side compare slider */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="relative w-full aspect-[9/16] max-h-[480px] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl flex items-center justify-center">
                  {compareMode ? (
                    // Interactive side-by-side comparison slider
                    <div className="relative w-full h-full select-none overflow-hidden">
                      {/* Under layer: Generated Scene */}
                      <Image
                        src={selectedScene.activeImageUrl}
                        alt="Generated"
                        fill
                        className="object-contain"
                      />
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                        {t.sliderGenerated}
                      </span>

                      {/* Top layer: Original Upload (clipped by slider) */}
                      <div
                        className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-emerald-400 shadow-2xl"
                        style={{ width: `${compareSliderPos}%` }}
                      >
                        <div className="relative w-full h-full min-w-[320px]">
                          <Image
                            src={originalAssetUrl}
                            alt="Original"
                            fill
                            className="object-contain"
                          />
                          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-amber-400 border border-amber-500/30">
                            {t.sliderOriginal}
                          </span>
                        </div>
                      </div>

                      {/* Slider handle */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={compareSliderPos}
                        onChange={(e) => setCompareSliderPos(Number(e.target.value))}
                        className="absolute inset-x-0 bottom-10 w-4/5 mx-auto opacity-70 hover:opacity-100 cursor-pointer accent-emerald-500 z-20"
                      />
                    </div>
                  ) : (
                    // Standard single image view
                    <Image
                      src={selectedScene.activeImageUrl}
                      alt={selectedScene.sceneName}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>

                {/* Quick actions for image */}
                <div className="w-full flex items-center justify-between gap-2 mt-4">
                  <a
                    href={selectedScene.activeImageUrl}
                    download={`adscene_${selectedScene.templateId}.png`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadImage}</span>
                  </a>

                  <button
                    onClick={() => handleSceneAction("upscale")}
                    disabled={isProcessingAction}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.upscale}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: AI Production Prompts & Video Cues */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {/* 1. MASTER VIDEO PROMPT (Crucial requirement from prompt) */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/40 shadow-lg relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Film className="w-4 h-4" />
                      <span>{t.copyVideoPrompt}</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedScene.videoPrompt, "video")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition"
                    >
                      {copiedKey === "video" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "video" ? t.promptCopied : (lang === "ar" ? "نسخ" : "Copy")}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-zinc-200 bg-black/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                    {selectedScene.videoPrompt}
                  </p>
                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-400" />
                      <span>{selectedScene.cameraMotion}</span>
                    </span>
                    <span>•</span>
                    <span>{selectedScene.durationSeconds}s duration</span>
                  </div>
                </div>

                {/* 2. Commercial Image Prompt */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t.copyImagePrompt}</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedScene.imagePrompt, "image")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
                    >
                      {copiedKey === "image" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "image" ? t.promptCopied : (lang === "ar" ? "نسخ" : "Copy")}</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 bg-black/40 p-2.5 rounded-xl border border-white/5 line-clamp-3 leading-relaxed">
                    {selectedScene.imagePrompt}
                  </p>
                </div>

                {/* 3. Marketing Copy / Caption & Voiceover */}
                {(selectedScene.captionLine || selectedScene.voiceoverLine) && (
                  <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">{t.copyVoiceover}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${selectedScene.captionLine || ""}\n\nVoiceover:\n${selectedScene.voiceoverLine || ""}`,
                            "copy"
                          )
                        }
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-medium"
                      >
                        {copiedKey === "copy" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "copy" ? t.promptCopied : (lang === "ar" ? "نسخ" : "Copy")}</span>
                      </button>
                    </div>
                    {selectedScene.captionLine && (
                      <div className="text-xs text-zinc-300 font-medium">
                        <span className="text-zinc-500 block text-[10px] uppercase">Caption / Hook</span>
                        "{selectedScene.captionLine}"
                      </div>
                    )}
                    {selectedScene.voiceoverLine && (
                      <div className="text-xs text-zinc-400">
                        <span className="text-zinc-500 block text-[10px] uppercase">Voiceover Line</span>
                        "{selectedScene.voiceoverLine}"
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Studio Action Tools: Regenerate, Variation, Edit with Instruction */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-3">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === "ar" ? "أدوات التعديل وإعادة التوليد" : "Studio Refinement & Variations"}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSceneAction("regenerate")}
                      disabled={isProcessingAction}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessingAction ? "animate-spin" : ""}`} />
                      <span>{t.regenerate}</span>
                    </button>

                    <button
                      onClick={() => handleSceneAction("variation")}
                      disabled={isProcessingAction}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>{t.variation}</span>
                    </button>
                  </div>

                  {/* Text Instruction Edit */}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      placeholder={t.editInstructionPlaceholder}
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSceneAction("edit")}
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSceneAction("edit")}
                      disabled={!editInstruction.trim() || isProcessingAction}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.applyEdit}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
