"use client";

import { useState } from "react";
import { Sliders, Sparkles, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { BriefFormData, ProductAnalysis } from "@/lib/types";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";

interface StepBriefProps {
  analysis: ProductAnalysis;
  onGenerate: (brief: BriefFormData) => void;
  onBack: () => void;
  isGenerating: boolean;
}

export default function StepBrief({ analysis, onGenerate, onBack, isGenerating }: StepBriefProps) {
  const { t, lang } = useLanguage();

  const [targetMarket, setTargetMarket] = useState("Egypt/MENA");
  const [platform, setPlatform] = useState("Instagram Reels/Stories");
  const [aspectRatios, setAspectRatios] = useState<string[]>(["9:16"]);
  const [tone, setTone] = useState("Luxury");
  const [modelType, setModelType] = useState<"none" | "hands" | "full">("none");
  const [modelDescription, setModelDescription] = useState("");
  const [sceneCount, setSceneCount] = useState<4 | 8 | 12>(4);
  const [brandColors, setBrandColors] = useState("");
  const [slogan, setSlogan] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  const toggleAspectRatio = (ratio: string) => {
    if (aspectRatios.includes(ratio)) {
      if (aspectRatios.length > 1) {
        setAspectRatios(aspectRatios.filter((r) => r !== ratio));
      }
    } else {
      setAspectRatios([...aspectRatios, ratio]);
    }
  };

  const handleStartGeneration = () => {
    onGenerate({
      targetMarket,
      platform,
      aspectRatios,
      tone,
      modelType,
      modelDescription,
      sceneCount,
      brandColors,
      slogan,
      extraNotes,
    });
  };

  // Credit calculation
  const creditsNeeded = sceneCount;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2 mb-2">
          <Sliders className="w-6 h-6 text-emerald-400" />
          {t.briefTitle}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">{t.briefSubtitle}</p>
      </div>

      <div className="flex flex-col gap-6 glass-panel rounded-3xl p-6 sm:p-8">
        {/* Row 1: Target Market & Advertising Platform */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Market */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-300">{t.targetMarket}</label>
            <select
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="Egypt/MENA">{t.marketMena}</option>
              <option value="GCC">{t.marketGcc}</option>
              <option value="USA">{t.marketUsa}</option>
              <option value="Europe">{t.marketEurope}</option>
              <option value="Asia">{t.marketAsia}</option>
            </select>
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-300">{t.platform}</label>
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                if (e.target.value.includes("Reels") || e.target.value.includes("TikTok")) {
                  setAspectRatios(["9:16"]);
                } else if (e.target.value.includes("Amazon") || e.target.value.includes("Google")) {
                  setAspectRatios(["1:1"]);
                } else if (e.target.value.includes("Website")) {
                  setAspectRatios(["16:9"]);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="Instagram Reels/Stories">{t.platformInstagram}</option>
              <option value="TikTok Ads">{t.platformTiktok}</option>
              <option value="Facebook/Meta Ads">{t.platformMeta}</option>
              <option value="Amazon listing">{t.platformAmazon}</option>
              <option value="Google Shopping">{t.platformGoogle}</option>
              <option value="Website hero">{t.platformWebsite}</option>
            </select>
          </div>
        </div>

        {/* Aspect Ratios Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-300">{t.aspectRatios}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { ratio: "9:16", label: "9:16 (Story/Reel)" },
              { ratio: "1:1", label: "1:1 (Square/Feed)" },
              { ratio: "4:5", label: "4:5 (Portrait Feed)" },
              { ratio: "16:9", label: "16:9 (Landscape Banner)" },
            ].map((item) => {
              const isSelected = aspectRatios.includes(item.ratio);
              return (
                <button
                  type="button"
                  key={item.ratio}
                  onClick={() => toggleAspectRatio(item.ratio)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center transition ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-300">{t.tone}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: "Luxury", label: t.toneLuxury },
              { id: "Minimal", label: t.toneMinimal },
              { id: "Energetic", label: t.toneEnergetic },
              { id: "Cozy/Lifestyle", label: t.toneLifestyle },
              { id: "Tech/Futuristic", label: t.toneTech },
              { id: "Natural/Organic", label: t.toneOrganic },
              { id: "Bold/Pop", label: t.toneBold },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setTone(item.id)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition ${
                  tone === item.id
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Human Model Option */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
          <label className="text-xs font-bold text-zinc-300">{t.humanModel}</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: "none" as const, label: t.modelNone },
              { id: "hands" as const, label: t.modelHands },
              { id: "full" as const, label: t.modelFull },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setModelType(item.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition ${
                  modelType === item.id
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {modelType !== "none" && (
            <input
              type="text"
              placeholder={t.modelDescriptionPlaceholder}
              value={modelDescription}
              onChange={(e) => setModelDescription(e.target.value)}
              className="mt-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          )}
        </div>

        {/* Scene Count Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-300">{t.sceneCount}</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { count: 4 as const, label: t.scenes4 },
              { count: 8 as const, label: t.scenes8 },
              { count: 12 as const, label: t.scenes12 },
            ].map((item) => (
              <button
                type="button"
                key={item.count}
                onClick={() => setSceneCount(item.count)}
                className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition ${
                  sceneCount === item.count
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Branding Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">{t.brandColors}</label>
            <input
              type="text"
              placeholder={t.brandColorsPlaceholder}
              value={brandColors}
              onChange={(e) => setBrandColors(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">{t.slogan}</label>
            <input
              type="text"
              placeholder={t.sloganPlaceholder}
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-300">{t.extraNotes}</label>
          <textarea
            rows={2}
            placeholder={t.extraNotesPlaceholder}
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Cost & Credit Estimate Card */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                {lang === "ar"
                  ? `استهلاك متوقع: ${creditsNeeded} اعتمادات إعلانية`
                  : `Estimated Cost: ${creditsNeeded} AI Studio Credits`}
              </span>
              <span className="text-[11px] text-zinc-400">
                {lang === "ar"
                  ? `يشمل توليد ${creditsNeeded} مشاهد مختلفة + أوامر فيديو جاهزة للذكاء الاصطناعي + فحص المطابقة`
                  : `Includes ${creditsNeeded} ad scenes + video motion prompts + fidelity verification`}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Google Gemini Imagen 3</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Image Generation Locked</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
            <span>{lang === "ar" ? "السابق" : "Back"}</span>
          </button>

          <button
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className="flex items-center gap-2.5 py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>{lang === "ar" ? "جاري التوليد..." : "Generating..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.startGeneration}</span>
                <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
