"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { UploadCloud, AlertTriangle, CheckCircle2, Sparkles, Image as ImageIcon, ArrowRight } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface StepUploadProps {
  onUploadSuccess: (data: { projectId: string; assetUrl: string; width: number; height: number; resolutionWarning: boolean }) => void;
  onViewDemoProject?: () => void;
}

export default function StepUpload({ onUploadSuccess, onViewDemoProject }: StepUploadProps) {
  const { t, lang } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Please select a PNG, JPG, or WEBP image.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 15MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Read dimensions
    const img = new window.Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;
  }, []);

  // Paste support (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          processFile(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onUploadSuccess(data);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectDemo = async (demoKey: "perfume" | "serum" | "watch") => {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("demoType", demoKey);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo selection failed");

      onUploadSuccess(data);
    } catch (err: any) {
      setError(err.message || "Failed to load demo");
    } finally {
      setIsUploading(false);
    }
  };

  const hasResolutionWarning = dimensions ? dimensions.width < 1024 || dimensions.height < 1024 : false;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* Title & Description */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          {t.uploadTitle}
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {t.uploadSubtitle}
        </p>
      </div>

      {/* Quick Instant Result Demo Banner */}
      {onViewDemoProject && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-teal-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 text-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {lang === "ar"
                  ? "تريد رؤية النتيجة فوراً؟ مشروع إعلاني كامل جاهز للمعاينة"
                  : "Want to see instant results? Full AI ad campaign ready"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {lang === "ar"
                  ? "4 مشاهد تجارية فائقة الدقة + أوامر الفيديو السينمائية (عطر العود الملكي)"
                  : "4 commercial ad scenes + video motion prompts (Oud Royale)"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewDemoProject}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>{lang === "ar" ? "معاينة المشاهد الإعلانية الآن" : "Preview Ad Scenes Now"}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${lang === "ar" ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}

      {/* Main Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 flex flex-col items-center justify-center min-h-[360px] glass-panel ${
          isDragging
            ? "border-emerald-400 bg-emerald-950/20 shadow-2xl shadow-emerald-500/20 scale-[1.01]"
            : previewUrl
            ? "border-emerald-500/40 bg-zinc-900/40"
            : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 cursor-pointer"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/60 group">
              <Image
                src={previewUrl}
                alt="Product preview"
                fill
                className="object-contain p-2"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setDimensions(null);
                }}
                className="absolute top-2 right-2 px-2.5 py-1 text-xs rounded-lg bg-black/70 hover:bg-black text-zinc-300 border border-white/10 transition"
              >
                {lang === "ar" ? "تغيير الصورة" : "Change"}
              </button>
            </div>

            {/* Quality & Resolution Info */}
            {dimensions && (
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>{dimensions.width} × {dimensions.height} px</span>
                  </span>
                  <span>{((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB</span>
                </div>

                {hasResolutionWarning ? (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-300 text-xs text-start">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>{t.resolutionWarning}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-600/40 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.resolutionGood}</span>
                  </div>
                )}
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUploadSubmit();
              }}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>{lang === "ar" ? "جاري الرفع والفحص..." : "Uploading & Scanning..."}</span>
                </>
              ) : (
                <>
                  <span>{t.continueToAnalyze}</span>
                  <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 mb-1">
              {t.dragDropText}
            </h3>
            <p className="text-xs text-zinc-400 mb-2">{t.pasteHint}</p>
            <span className="text-[11px] text-zinc-500">{t.fileFormats}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Demo Products Section */}
      <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col items-center">
        <span className="text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {t.tryDemoTitle}
        </span>
        <div className="flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={() => handleSelectDemo("perfume")}
            disabled={isUploading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition hover:border-amber-500/40"
          >
            <span className="text-base">✨</span>
            <span>{t.demoPerfume}</span>
          </button>
          <button
            onClick={() => handleSelectDemo("serum")}
            disabled={isUploading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition hover:border-emerald-500/40"
          >
            <span className="text-base">🌿</span>
            <span>{t.demoSerum}</span>
          </button>
          <button
            onClick={() => handleSelectDemo("watch")}
            disabled={isUploading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition hover:border-blue-500/40"
          >
            <span className="text-base">⌚</span>
            <span>{t.demoWatch}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
