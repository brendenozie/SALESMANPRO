"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

/* ==========================================================================
   Type Contracts (Maintained for perfect drop-in integration)
   ========================================================================== */
export interface StepItem {
  key: string;
  title: string;
}

export interface SetupWizardLayoutProps {
  isSubmitting: boolean;
  submissionError: string | null;
  setSubmissionError: (error: string | null) => void;
  setIsSubmitting: (state: boolean) => void;
  isAiProcessing: boolean;
  aiStatus: string;
  stepIndex: number;
  totalSteps: number;
  currentTitle: string;
  allSteps: StepItem[];
  percent: number;
  StepContent: React.ReactNode;
  prev: () => void;
  next: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  setStepIndex: (index: number) => void;
}

export default function SetupWizardLayout({
  isSubmitting,
  submissionError,
  setSubmissionError,
  setIsSubmitting,
  isAiProcessing,
  aiStatus,
  stepIndex,
  totalSteps,
  currentTitle,
  allSteps,
  percent,
  StepContent,
  prev,
  next,
  handleSubmit,
  setStepIndex,
}: SetupWizardLayoutProps) {
  const [copied, setCopied] = useState(false);

  const copyErrorToClipboard = async () => {
    if (!submissionError) return;
    await navigator.clipboard.writeText(submissionError);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 flex flex-col md:flex-row relative font-sans antialiased selection:bg-indigo-500/30 transition-colors duration-300">
      
      {/* ====================================================================
          1. SUBMISSION / TRANSACTIONAL OVERLAY MODAL
          ==================================================================== */}
      <AnimatePresence>
        {(isSubmitting || submissionError) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 dark:bg-black/80 backdrop-blur-xl p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full text-center relative overflow-hidden"
            >
              {/* Top Accent Bar */}
              <div
                className={clsx(
                  "absolute top-0 left-0 right-0 h-1.5",
                  submissionError
                    ? "bg-rose-500"
                    : "bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500 animate-gradient-xy"
                )}
              />

              {!submissionError ? (
                /* --- LOADING STATE --- */
                <>
                  <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-violet-500/20 border-t-violet-600 rounded-full animate-spin" />
                    <div className="absolute inset-2 border-4 border-indigo-500/10 border-r-indigo-500 rounded-full animate-spin [animation-duration:1.5s] reversed" />
                    <div className="absolute inset-4 border-4 border-emerald-500/10 border-b-emerald-400 rounded-full animate-spin [animation-duration:0.8s]" />
                    <CloudArrowUpIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                  </div>

                  <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                    Setting Up Your Shop
                  </h3>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 px-2 leading-relaxed">
                    We’re saving your details, connecting everything securely, and polishing up your store. Hang tight for just a moment!
                  </p>
                </>
              ) : (
                /* --- ERROR VIEW --- */
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-h-[80vh] flex flex-col text-left"
                >
                  <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center flex-shrink-0 border border-rose-100 dark:border-rose-900/30">
                      <ExclamationTriangleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                        Hit a Bump in the Road
                      </h3>
                      <p className="text-xs text-zinc-400 font-medium">
                        Something went sideways while saving your details
                      </p>
                    </div>
                  </div>

                  {/* Interactive Error Viewport */}
                  <div className="relative group bg-zinc-950 rounded-xl p-4 mb-6 border border-zinc-800 shadow-inner">
                    <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={copyErrorToClipboard}
                        className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-zinc-800 text-zinc-400 hover:text-white transition"
                      >
                        {copied ? "Copied!" : "Copy Details"}
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      <pre className="text-xs text-rose-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                        {submissionError}
                      </pre>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={() => setSubmissionError(null)}
                      className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl font-bold text-sm tracking-wide transition shadow-sm active:scale-[0.99]"
                    >
                      Give It Another Shot
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmissionError(null);
                        setIsSubmitting(false);
                      }}
                      className="text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 py-2 transition text-center"
                    >
                      Close & Fix Info
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          2. ARTIFICIAL INTELLIGENCE OVERLAY
          ==================================================================== */}
      <AnimatePresence>
        {isAiProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 dark:bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              className="p-8 sm:p-10 max-w-md w-full text-center flex flex-col items-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur-xl opacity-60 animate-pulse" />
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 bg-gradient-to-tr from-violet-600 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-xl border border-white/20 relative z-10"
                >
                  <SparklesIcon className="w-12 h-12 text-white drop-shadow-md" />
                </motion.div>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                AI Magic in Progress
              </h3>

              <AnimatePresence mode="wait">
                <motion.p
                  key={aiStatus}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-base font-semibold text-indigo-200 min-h-[1.5rem]"
                >
                  {aiStatus}
                </motion.p>
              </AnimatePresence>

              <p className="text-xs text-zinc-400 max-w-xs mt-3 leading-relaxed">
                Cooking up tailored layouts, organizing your content, and getting everything tailored to your vibe.
              </p>

              {/* Pulsing Dots */}
              <div className="flex items-center gap-2 mt-8 bg-zinc-900/60 px-4 py-2 rounded-full border border-zinc-800">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-2.5 h-2.5 bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          3. MOBILE PERSISTENT TOP UTILITY BAR
          ==================================================================== */}
      <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 py-3.5 px-5 flex justify-between items-center shadow-sm sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-zinc-900/90">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Your Progress
          </span>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
          </span>
        </div>
        <div className="max-w-[50%] bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200/40 dark:border-zinc-700/30">
          <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate tracking-tight">
            {currentTitle}
          </p>
        </div>
      </div>

      {/* ====================================================================
          4. DESKTOP WIZARD NAVIGATION SIDEBAR
          ==================================================================== */}
      <motion.aside
        className="hidden md:flex flex-col bg-white dark:bg-zinc-900/70 border-r border-zinc-200/50 dark:border-zinc-800/60 p-0 sticky top-0 h-screen z-10 overflow-hidden backdrop-blur-xl"
        initial={false}
        animate={{
          width: stepIndex > 0 ? "18rem" : "0rem",
          padding: stepIndex > 0 ? "1.5rem" : "0rem",
        }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
      >
        <div className="w-60 flex flex-col h-full justify-between">
          <div>
            {/* Header Module Meta */}
            <div className="flex items-center space-x-2.5 mb-8 px-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Squares2X2Icon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                  Store Builder
                </h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Setup Guide</p>
              </div>
            </div>

            {/* Stepper Interactive Loops */}
            <nav className="flex flex-col gap-2 overflow-y-auto max-h-[70vh] pr-1 custom-scrollbar">
              {allSteps.map((s, i) => {
                const isCompleted = i < stepIndex;
                const isActive = i === stepIndex;

                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStepIndex(i)}
                    className={clsx(
                      "group flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-200 text-left relative outline-none focus:ring-1 focus:ring-indigo-500/30",
                      isActive
                        ? "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white shadow-sm font-semibold"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                    )}
                  >
                    {/* Active Track Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <span
                      className={clsx(
                        "w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold border transition-all duration-200 flex-shrink-0",
                        isCompleted
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400"
                          : isActive
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/10"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                      )}
                    >
                      {isCompleted ? <CheckCircleIcon className="w-5 h-5 stroke-[2.5]" /> : i + 1}
                    </span>

                    <span className="text-xs tracking-tight font-medium truncate">
                      {s.title}
                    </span>
                  </button>
                );
              })}

              {/* Final Review Step */}
              <button
                type="button"
                onClick={() => setStepIndex(allSteps.length)}
                className={clsx(
                  "group flex items-center gap-3.5 p-3 rounded-2xl transition text-left mt-2 border border-dashed",
                  stepIndex === allSteps.length
                    ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-200"
                )}
              >
                <span
                  className={clsx(
                    "w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition",
                    stepIndex === allSteps.length
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  )}
                >
                  ★
                </span>
                <span className="text-xs tracking-tight font-medium">Final Review</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Status Footer */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 tracking-wider uppercase flex items-center justify-between">
            <span>System Ready</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
        </div>
      </motion.aside>

      {/* ====================================================================
          5. MAIN WORKSPACE CONTAINER WINDOW
          ==================================================================== */}
      <main className="flex-1 flex flex-col py-4 sm:py-6 relative max-w-6xl mx-auto w-full px-0 sm:px-4 lg:px-4">
        
        {/* Progress Bar & Desktop Step Header Wrapper */}
        <motion.div
          className="overflow-hidden flex-shrink-0"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: stepIndex > 0 ? "auto" : 0,
            opacity: stepIndex > 0 ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Segmented Progress Bar */}
          <div className="relative mb-6 pt-2">
            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Milestone Dots */}
            <div className="absolute inset-x-0 top-1.5 flex justify-between items-center px-0.5 pointer-events-none">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-2 h-2 rounded-full border transition-all duration-300",
                    i <= stepIndex
                      ? "bg-indigo-500 border-indigo-400 scale-110"
                      : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center mb-6 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/60 text-xs text-zinc-400 font-bold uppercase tracking-wider">
            <div className="flex items-center space-x-2">
              <span className="text-zinc-500">You are on:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
              </span>
            </div>
            <span className="text-zinc-800 dark:text-zinc-200 tracking-tight font-black text-sm normal-case">
              {currentTitle}
            </span>
          </div>
        </motion.div>

        {/* ====================================================================
            6. VIEWPORT CONTENT WINDOW
            ==================================================================== */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 rounded-3xl flex-1 overflow-y-auto min-h-[55vh] shadow-sm transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {StepContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ====================================================================
            7. LOWER CONTROL BAR
            ==================================================================== */}
        <div className="sticky bottom-0 md:static bg-white dark:bg-zinc-950 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/60 pt-4 mt-6 flex justify-between items-center px-4 md:px-0 py-3 z-20 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95">
          
          {/* Back Button */}
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={prev}
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all duration-200",
              stepIndex === 0
                ? "opacity-0 pointer-events-none"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-98"
            )}
          >
            <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Back</span>
          </button>

          {/* Next / Submit Button */}
          {stepIndex < allSteps.length ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-md shadow-zinc-900/10 dark:shadow-none active:scale-98"
            >
              <span>Continue</span>
              <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Launching Store...</span>
                </>
              ) : (
                <>
                  <span>Launch My Store</span>
                  <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}