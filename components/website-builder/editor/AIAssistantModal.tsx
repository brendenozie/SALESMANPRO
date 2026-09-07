"use client";

import React, { useState } from "react";
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon, CheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSlug: string;
  currentConfig: any;
  activePageSlug: string;
  onApplyChanges: (newConfig: any) => void;
}

const SUGGESTIONS = [
  "Make the homepage look more modern with sleek rounded cards and vibrant accents",
  "Change the hero headline to promote our fresh new collection with same-day delivery",
  "Move the featured products section above the about section",
  "Add a WhatsApp contact button in the header",
  "Change the color palette to emerald green and gold",
  "Create an About Us page with our brand story and verified customer stats",
  "Add a customer testimonials review section to build trust",
];

export default function AIAssistantModal({
  isOpen,
  onClose,
  storeSlug,
  currentConfig,
  activePageSlug,
  onApplyChanges,
}: AIAssistantModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    explanation: string;
    appliedActions: { action: string; summary: string }[];
    updatedConfig: any;
  } | null>(null);

  if (!isOpen) return null;

  const handleSendPrompt = async (selectedPrompt?: string) => {
    const textToSend = selectedPrompt || prompt;
    if (!textToSend.trim()) return;

    setLoading(true);
    setLastResult(null);

    try {
      const res = await fetch(`/api/website-builder/${storeSlug}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          activePageSlug,
          currentConfig,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to process AI design edit.");
      }

      setLastResult(json.data);
      onApplyChanges(json.data.updatedConfig);
      toast.success("AI changes applied to draft preview!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "AI design request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-linear-to-r from-rose-50/50 via-transparent to-indigo-50/50 dark:from-rose-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-rose-500 to-indigo-600 text-white shadow-md">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                AI Website Designer
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Tell the AI what you want changed in plain English.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Result Card (if any) */}
          {lastResult && (
            <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <CheckIcon className="w-5 h-5" />
                <span>AI Updates Applied to Draft Preview:</span>
              </div>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                {lastResult.explanation}
              </p>
              <div className="space-y-1.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                {lastResult.appliedActions.map((act, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold px-1.5 py-0.5 rounded-sm bg-emerald-200/60 dark:bg-emerald-900/60 text-[10px] uppercase">
                      {act.action}
                    </span>
                    <span>{act.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Suggestion Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(s);
                    handleSendPrompt(s);
                  }}
                  disabled={loading}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition text-left"
                >
                  ✨ {s}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Form */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Custom Instruction
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Make my hero section shorter, move featured products above about, and change buttons to rounded emerald green..."
                className="w-full p-4 pr-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 resize-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleSendPrompt()}
                disabled={loading || !prompt.trim()}
                className="absolute right-3 bottom-4 p-2.5 rounded-xl bg-linear-to-r from-rose-500 to-indigo-600 text-white disabled:opacity-40 hover:opacity-90 shadow-md transition"
              >
                {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">
              AI operations are tenant-scoped, verified, and billed from your store's AI credit wallet. AI modifies your working draft; you always preview before publishing.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
          >
            Close & Review Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
