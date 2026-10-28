"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Globe, History, PlusCircle, ShieldCheck, Key, LogOut } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import LoginModal from "./LoginModal";

interface NavbarProps {
  onNewProject?: () => void;
}

export default function Navbar({ onNewProject }: NavbarProps) {
  const { lang, t, toggleLang } = useLanguage();
  const { user, isAuthenticated, isGeminiConnected, openLoginModal, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#08090d]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">{t.appName}</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Studio Pro
                </span>
              </div>
              <span className="text-xs text-zinc-400 hidden sm:inline">{t.appTagline}</span>
            </div>
          </Link>

          {/* Center Gemini Status Pill */}
          <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-zinc-200">Google Gemini (Imagen 3)</span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-mono text-[11px]">
              {isGeminiConnected ? (lang === "ar" ? "محرك الصور متصل ⚡" : "Image Engine Active ⚡") : (lang === "ar" ? "جاهز للتوليد" : "Ready to Generate")}
            </span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* History link */}
            <Link
              href="/projects"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition"
            >
              <History className="w-4 h-4 text-zinc-400" />
              <span className="hidden sm:inline">{t.history}</span>
            </Link>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.toggleLanguage}</span>
            </button>

            {/* Gmail Authentication Button / Profile Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs text-white transition"
                >
                  {user.avatar ? (
                    <div className="relative w-5 h-5 rounded-full overflow-hidden border border-emerald-400">
                      <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-bold flex items-center justify-center text-white">
                      {user.email[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[110px] truncate hidden md:inline">{user.email}</span>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-3 z-50 flex flex-col gap-2">
                    <div className="px-2 py-1.5 border-b border-zinc-800/80">
                      <span className="text-xs font-bold text-white block truncate">{user.name}</span>
                      <span className="text-[11px] text-zinc-400 block truncate">{user.email}</span>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        openLoginModal();
                      }}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
                    >
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === "ar" ? "تعديل مفتاح Gemini API" : "Manage Gemini API Key"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.signOut}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs shadow-md transition group"
              >
                {/* Google G icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span>{t.signInWithGoogle}</span>
              </button>
            )}

            {/* New Project Button */}
            {onNewProject ? (
              <button
                onClick={onNewProject}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.newProject}</span>
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.newProject}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Global Login & Gemini Connect Modal */}
      <LoginModal />
    </>
  );
}
