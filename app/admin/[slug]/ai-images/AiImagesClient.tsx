"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  SparklesIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  PaintBrushIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { useGenerateImage, useAICredits } from "@/hooks/useAI";

interface Props {
  companyId: string;
}

export default function AiImagesClient({ companyId }: Props) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<"vivid" | "natural">("vivid");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [action, setAction] = useState<"GENERATE_IMAGE" | "PRODUCT_PHOTO" | "REMOVE_BACKGROUND" | "REPLACE_BACKGROUND">("GENERATE_IMAGE");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const { data: creditsData } = useAICredits();
  const generateMutation = useGenerateImage();

  const balance = creditsData?.balance ?? 0;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a description for the image.");
      return;
    }

    if (balance < 20) {
      toast.error("Insufficient AI credits. Please top up your wallet to generate images.");
      return;
    }

    setGeneratedImage(null);

    try {
      const res = await generateMutation.mutateAsync({
        prompt: prompt.trim(),
        modelId: "dall-e-3",
        aspectRatio,
        style,
        action,
      });

      if (res && res.images && res.images.length > 0) {
        setGeneratedImage(res.images[0].url);
        toast.success(`Image generated & saved to Media Library! (${res.creditsConsumed} Credits used)`);
      } else {
        toast.error("Image generation completed with no output.");
      }
    } catch (error: any) {
      console.error("[IMAGE_GEN_CLIENT_ERROR]", error);
      toast.error(error.message || "Failed to generate image.");
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    window.open(generatedImage, "_blank");
    toast.success("Opening high-res image...");
  };

  return (
    <main className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 md:p-6 font-sans overflow-hidden">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Central AI Studio
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-emerald-500" />
              Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Generation.</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
            <BoltIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              {balance.toLocaleString()} Credits
            </span>
          </div>
        </header>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
          {/* Controls Sidebar */}
          <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col shrink-0 overflow-y-auto shadow-sm">
            <form onSubmit={handleGenerate} className="space-y-4 flex-1 flex flex-col">
              {/* Action Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mode
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                >
                  <option value="GENERATE_IMAGE">Custom Prompt Art</option>
                  <option value="PRODUCT_PHOTO">Clean Studio Product Shot</option>
                  <option value="REMOVE_BACKGROUND">Isolate & Remove Background</option>
                  <option value="REPLACE_BACKGROUND">Place in Commercial Lifestyle Scene</option>
                </select>
              </div>

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PaintBrushIcon className="h-4 w-4 text-emerald-500" />
                  Prompt Details
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your subject, lighting, colors, and composition..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all"
                />
              </div>

              {/* Style Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rendering Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                >
                  <option value="vivid">Vivid (Hyper-realistic & Dramatic)</option>
                  <option value="natural">Natural (Soft Commercial Lighting)</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ArrowsRightLeftIcon className="h-4 w-4 text-emerald-500" />
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "1:1", value: "1:1", desc: "Square" },
                    { label: "16:9", value: "16:9", desc: "Landscape" },
                    { label: "9:16", value: "9:16", desc: "Portrait" },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value as any)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                        aspectRatio === ratio.value
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500/50"
                      }`}
                    >
                      <span className="text-xs font-bold">{ratio.label}</span>
                      <span className="text-[9px]">{ratio.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              {/* Action Button */}
              <button
                type="submit"
                disabled={generateMutation.isPending || !prompt.trim()}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {generateMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Generating via DALL-E...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    Generate (~20 Credits)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Canvas / Preview Area */}
          <div className="flex-1 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-sm">
            {generateMutation.isPending ? (
              <div className="flex flex-col items-center text-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <SparklesIcon className="h-8 w-8 text-emerald-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rendering High-Resolution Visual</h3>
                  <p className="text-xs text-slate-500 mt-1">Generating with DALL-E & persisting directly to S3 Media Library...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative group max-h-full max-w-full flex items-center justify-center">
                  <img
                    src={generatedImage}
                    alt="Generated output"
                    className="rounded-2xl max-h-[100%] max-w-[100%] object-contain border border-slate-200 dark:border-slate-700/50 shadow-lg"
                  />

                  {/* Hover Overlay Controls */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleDownload}
                      className="bg-black/70 hover:bg-black/90 backdrop-blur-md text-white p-2.5 rounded-xl transition-all flex items-center gap-2"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span className="text-xs font-bold pr-1">Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-slate-400 max-w-sm">
                <PhotoIcon className="h-16 w-16 stroke-1 mb-4 text-slate-300 dark:text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Image Generated Yet</h3>
                <p className="text-xs">
                  Describe your idea in the prompt area on the left and hit generate to render and save assets to your store.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}