"use client";

import React, { useState } from "react";
import { X, Sparkles, Key, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";

export default function LoginModal() {
  const { user, isLoginModalOpen, closeLoginModal, loginWithGoogle, setGeminiApiKey } = useAuth();
  const { t, lang } = useLanguage();

  const [email, setEmail] = useState(user?.email || "");
  const [apiKey, setApiKey] = useState(user?.geminiApiKey || "");
  const [showKeyInput, setShowKeyInput] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = email.includes("@") ? email : `${email || "creative.director"}@gmail.com`;
    loginWithGoogle(finalEmail, undefined, apiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeLoginModal();
    }, 1200);
  };

  const handleQuickDemoGoogle = () => {
    loginWithGoogle("director@adscene.studio", "Creative Director", apiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeLoginModal();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0d0f17] border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden animate-fadeIn">
        {/* Glow Header */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon & Google Emblem */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
            {/* Google SVG Logo */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {t.loginModalTitle}
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Google Gemini Imagen 3 Engine</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          {t.loginModalSubtitle}
        </p>

        {savedSuccess ? (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h4 className="text-sm font-bold text-white">{t.apiKeySavedSuccess}</h4>
            <span className="text-xs text-zinc-400">{user?.email}</span>
          </div>
        ) : (
          <form onSubmit={handleGoogleSubmit} className="flex flex-col gap-4">
            {/* Quick 1-Click Login Button */}
            <button
              type="button"
              onClick={handleQuickDemoGoogle}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md transition group"
            >
              {/* Google G icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{t.googleOneClickLogin}</span>
            </button>

            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-x-0 h-px bg-zinc-800" />
              <span className="relative px-3 bg-[#0d0f17] text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                {lang === "ar" ? "أو أدخل بريدك الـ Gmail" : "or enter your Gmail"}
              </span>
            </div>

            {/* Email input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">{t.enterGmailAddress}</label>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Gemini API Key Section */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-emerald-500/20 flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>{t.geminiApiKeyLabel}</span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
                >
                  <span>Google AI Studio</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <input
                type="password"
                placeholder={t.geminiApiKeyPlaceholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />

              <p className="text-[10px] text-zinc-400 leading-normal">
                {lang === "ar"
                  ? "يتم استخدام مفتاح Gemini الخاص بك مباشرة لتوليد الصور عبر Google Imagen 3 بدون وسيط."
                  : "Your key is used directly to generate images via Google Imagen 3."}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition"
            >
              <span>{t.connectAndContinue}</span>
              <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
