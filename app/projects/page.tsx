"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { History, ArrowLeft, Trash2, ExternalLink, Calendar, Film } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageContext";

interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  targetMarket?: string;
  platform?: string;
  createdAt: string;
  assets: Array<{ url: string }>;
  scenes: Array<{ id: string; activeImageUrl?: string; sceneName: string }>;
}

export default function ProjectsHistoryPage() {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا المشروع؟" : "Are you sure you want to delete this project?")) {
      return;
    }
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t.projectsHistoryTitle}</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === "ar" ? "استعرض مشاريعك السابقة ولوحات القصة وحزم التصدير" : "Browse past ad campaigns, storyboards, and export packs"}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition"
          >
            <ArrowLeft className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
            <span>{t.backToStudio}</span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-800" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-300 mb-2">{t.noProjectsYet}</h3>
            <Link
              href="/"
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
            >
              {t.newProject}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const heroImage = proj.scenes[0]?.activeImageUrl || proj.assets[0]?.url || "/demo/perfume.svg";
              return (
                <div
                  key={proj.id}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-video bg-black/80 overflow-hidden">
                    <Image
                      src={heroImage}
                      alt={proj.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                      {proj.status}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-2 bg-zinc-950 flex-1 justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate">
                        {proj.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{proj.scenes.length} {t.scenesCountLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 mt-2">
                      <Link
                        href={`/storyboard/${proj.id}`}
                        target="_blank"
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "عرض لوحة القصة" : "View Storyboard"}</span>
                      </Link>

                      <button
                        onClick={(e) => handleDelete(proj.id, e)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition"
                        title={t.deleteProject}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
