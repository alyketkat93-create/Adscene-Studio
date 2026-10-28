"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Stepper, { StepNumber } from "@/components/Stepper";
import StepUpload from "@/components/StepUpload";
import StepAnalyze from "@/components/StepAnalyze";
import StepBrief from "@/components/StepBrief";
import StepGenerate from "@/components/StepGenerate";
import StepExport, { SceneItem } from "@/components/StepExport";
import { ProductAnalysis, BriefFormData } from "@/lib/types";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";

export default function StudioHomePage() {
  const { lang } = useLanguage();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [maxStepReached, setMaxStepReached] = useState<StepNumber>(1);

  // Project state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("Ad Project");
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStepMessage, setCurrentStepMessage] = useState("");
  const [generatedScenes, setGeneratedScenes] = useState<SceneItem[]>([]);
  const [targetSceneCount, setTargetSceneCount] = useState<number>(4);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);

  const goToStep = (step: StepNumber) => {
    setCurrentStep(step);
    if (step > maxStepReached) {
      setMaxStepReached(step);
    }
  };

  const handleUploadSuccess = (data: { projectId: string; assetUrl: string }) => {
    setProjectId(data.projectId);
    setAssetUrl(data.assetUrl);
    goToStep(2);
  };

  const handleViewDemoProject = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        const demoProj = data.projects[0];
        const fullRes = await fetch(`/api/projects/${demoProj.id}`);
        const fullData = await fullRes.json();
        const p = fullData.project;
        setProjectId(p.id);
        setProjectName(p.name);
        setAssetUrl(p.assets?.[0]?.url || "/demo/perfume.svg");
        setGeneratedScenes(p.scenes || []);
        setCurrentStep(5);
        setMaxStepReached(5);
      }
    } catch (e) {
      console.warn("Could not load demo project:", e);
    }
  };

  const handleAnalysisConfirmed = (confirmedAnalysis: ProductAnalysis) => {
    setAnalysis(confirmedAnalysis);
    setProjectName(confirmedAnalysis.product_name);
    goToStep(3);
  };

  const handleStartGeneration = async (brief: BriefFormData) => {
    if (!projectId || !analysis) return;
    setTargetSceneCount(brief.sceneCount);
    setIsGenerating(true);
    setIsGenerationComplete(false);
    setGenerationProgress(10);
    setCurrentStepMessage(lang === "ar" ? "صياغة أوامر المشاهد وحركة الكاميرا..." : "Synthesizing master camera prompts...");
    goToStep(4);

    try {
      // Trigger scene generation API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.geminiApiKey ? { "x-gemini-key": user.geminiApiKey } : {}),
        },
        body: JSON.stringify({
          projectId,
          brief,
          language: lang,
          geminiApiKey: user?.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");

      setGeneratedScenes(data.scenes || []);
      setGenerationProgress(100);
      setIsGenerationComplete(true);
      setCurrentStepMessage(lang === "ar" ? "اكتمل التوليد بنجاح!" : "All scenes rendered & verified!");
      setMaxStepReached(5);
    } catch (err: any) {
      alert(err.message || "Failed to generate scenes");
      setCurrentStepMessage(lang === "ar" ? "حدث خطأ أثناء التوليد" : "Generation encountered an issue");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetToNew = () => {
    setCurrentStep(1);
    setMaxStepReached(1);
    setProjectId(null);
    setAssetUrl(null);
    setAnalysis(null);
    setGeneratedScenes([]);
    setGenerationProgress(0);
    setIsGenerationComplete(false);
  };

  const handleUpdateScene = (updated: SceneItem) => {
    setGeneratedScenes((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar onNewProject={handleResetToNew} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Stepper
          currentStep={currentStep}
          maxStepReached={maxStepReached}
          onStepClick={(step) => setCurrentStep(step)}
        />

        <div className="mt-4">
          {currentStep === 1 && (
            <StepUpload
              onUploadSuccess={handleUploadSuccess}
              onViewDemoProject={handleViewDemoProject}
            />
          )}

          {currentStep === 2 && projectId && assetUrl && (
            <StepAnalyze
              projectId={projectId}
              assetUrl={assetUrl}
              onAnalysisConfirmed={handleAnalysisConfirmed}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && analysis && (
            <StepBrief
              analysis={analysis}
              onGenerate={handleStartGeneration}
              onBack={() => setCurrentStep(2)}
              isGenerating={isGenerating}
            />
          )}

          {currentStep === 4 && (
            <StepGenerate
              progress={generationProgress}
              currentStepMessage={currentStepMessage}
              scenes={generatedScenes}
              targetCount={targetSceneCount}
              isComplete={isGenerationComplete}
              onProceedToExport={() => goToStep(5)}
            />
          )}

          {currentStep === 5 && projectId && (
            <StepExport
              projectId={projectId}
              projectName={projectName}
              originalAssetUrl={assetUrl || ""}
              scenes={generatedScenes}
              onUpdateScene={handleUpdateScene}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-zinc-900 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>AdScene Studio Pro • Precision Commercial Advertising & Video Motion Prompts</span>
          <span className="font-mono text-[11px] text-zinc-600">Engineered for Veo, Runway, Kling, Luma & Sora</span>
        </div>
      </footer>
    </div>
  );
}
