"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, Plus, X, ArrowRight, ArrowLeft } from "lucide-react";
import { ProductAnalysis } from "@/lib/types";
import { useLanguage } from "./LanguageContext";

interface StepAnalyzeProps {
  projectId: string;
  assetUrl: string;
  onAnalysisConfirmed: (analysis: ProductAnalysis) => void;
  onBack: () => void;
}

export default function StepAnalyze({ projectId, assetUrl, onAnalysisConfirmed, onBack }: StepAnalyzeProps) {
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [newRule, setNewRule] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function runAnalysis() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed");
        if (isMounted) {
          setAnalysis(data.analysis);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to analyze product");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    runAnalysis();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const handleFieldChange = (field: keyof ProductAnalysis, value: any) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      [field]: value,
    });
  };

  const handleAddDoNotChange = () => {
    if (!newRule.trim() || !analysis) return;
    const updated = [...analysis.do_not_change, newRule.trim()];
    setAnalysis({ ...analysis, do_not_change: updated });
    setNewRule("");
  };

  const handleRemoveDoNotChange = (index: number) => {
    if (!analysis) return;
    const updated = analysis.do_not_change.filter((_, i) => i !== index);
    setAnalysis({ ...analysis, do_not_change: updated });
  };

  const handleConfirmAndProceed = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      // Save changes back to DB
      await fetch("/api/analyze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, analysis }),
      });
      onAnalysisConfirmed(analysis);
    } catch (err) {
      console.warn("Failed to save updated analysis:", err);
      onAnalysisConfirmed(analysis);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4 flex flex-col items-center text-center">
        {/* Animated Radar Scanning Visual */}
        <div className="relative w-48 h-48 rounded-3xl overflow-hidden border-2 border-emerald-500/40 bg-zinc-950 p-2 shadow-2xl shadow-emerald-500/10 mb-6">
          <Image
            src={assetUrl}
            alt="Analyzing product"
            fill
            className="object-contain p-4"
          />
          {/* Radar Scan Laser Line */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#22c55e] animate-radar" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{t.analyzingTitle}</h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md">{t.analyzingSubtitle}</p>
        
        <div className="mt-6 flex items-center gap-2 text-xs font-mono text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Extracting Geometry, Specular Reflections & Logos...</span>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4 text-center">
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm mb-4">
          {error || "Could not retrieve analysis"}
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs hover:bg-zinc-700 transition"
        >
          {lang === "ar" ? "العودة واختيار صورة أخرى" : "Go back & choose another image"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            {t.analysisReadyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">{t.analysisReadySubtitle}</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === "ar" ? "قفل الهوية مفعل" : "Fidelity Lock Active"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Thumbnail Preview */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl sticky top-24">
            <Image
              src={assetUrl}
              alt={analysis.product_name}
              fill
              className="object-contain p-4"
            />
            <div className="absolute bottom-3 inset-x-3 bg-black/75 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
              <span className="text-[11px] font-mono text-zinc-400 block truncate">
                {analysis.product_name}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                {analysis.category}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Fields */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">{t.fieldProductName}</label>
              <input
                type="text"
                value={analysis.product_name}
                onChange={(e) => handleFieldChange("product_name", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">{t.fieldCategory}</label>
              <input
                type="text"
                value={analysis.category}
                onChange={(e) => handleFieldChange("category", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Materials */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">{t.fieldMaterials}</label>
              <textarea
                rows={2}
                value={analysis.materials}
                onChange={(e) => handleFieldChange("materials", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>

            {/* Colors */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">{t.fieldColors}</label>
              <textarea
                rows={2}
                value={analysis.colors}
                onChange={(e) => handleFieldChange("colors", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shape */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">{t.fieldShape}</label>
              <input
                type="text"
                value={analysis.shape}
                onChange={(e) => handleFieldChange("shape", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Brand Text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">{t.fieldBrandText}</label>
              <input
                type="text"
                value={analysis.brand_text_visible}
                onChange={(e) => handleFieldChange("brand_text_visible", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Key Features */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">{t.fieldKeyFeatures}</label>
            <input
              type="text"
              value={analysis.key_features}
              onChange={(e) => handleFieldChange("key_features", e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Do Not Change Section */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-950/70 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {t.fieldDoNotChange}
              </span>
              <span className="text-[11px] text-zinc-500">
                {lang === "ar" ? "قواعد الحماية الصارمة ضد التشويه" : "Strict anti-drift directives"}
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 my-2">
              {analysis.do_not_change.map((rule, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-medium"
                >
                  <span>{rule}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoNotChange(idx)}
                    className="hover:text-red-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add new rule */}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                placeholder={t.addDoNotChangeItem}
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDoNotChange())}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddDoNotChange}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "إضافة" : "Add"}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
              <span>{lang === "ar" ? "السابق" : "Back"}</span>
            </button>

            <button
              onClick={handleConfirmAndProceed}
              disabled={saving}
              className="flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <span>{t.continueToBrief}</span>
              <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
