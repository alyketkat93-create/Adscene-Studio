"use client";

import { Check, UploadCloud, Scan, Sliders, Wand2, Download } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export type StepNumber = 1 | 2 | 3 | 4 | 5;

interface StepperProps {
  currentStep: StepNumber;
  onStepClick?: (step: StepNumber) => void;
  maxStepReached: StepNumber;
}

export default function Stepper({ currentStep, onStepClick, maxStepReached }: StepperProps) {
  const { t } = useLanguage();

  const steps = [
    { number: 1 as StepNumber, title: t.stepUpload, icon: UploadCloud },
    { number: 2 as StepNumber, title: t.stepAnalyze, icon: Scan },
    { number: 3 as StepNumber, title: t.stepBrief, icon: Sliders },
    { number: 4 as StepNumber, title: t.stepGenerate, icon: Wand2 },
    { number: 5 as StepNumber, title: t.stepExport, icon: Download },
  ];

  return (
    <nav className="w-full max-w-5xl mx-auto my-6 px-4">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-zinc-800 -z-10" />
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-emerald-500 transition-all duration-500 -z-10"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isAccessible = step.number <= maxStepReached;

          return (
            <button
              key={step.number}
              disabled={!isAccessible}
              onClick={() => onStepClick && isAccessible && onStepClick(step.number)}
              className={`flex flex-col items-center gap-2 group transition focus:outline-none ${
                isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : isCurrent
                    ? "bg-zinc-950 border-2 border-emerald-400 text-emerald-400 ring-4 ring-emerald-500/20 shadow-lg"
                    : "bg-zinc-900 border border-zinc-700 text-zinc-400"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-xs font-semibold tracking-wide transition hidden sm:inline ${
                  isCurrent ? "text-emerald-400" : isCompleted ? "text-zinc-200" : "text-zinc-500"
                }`}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
