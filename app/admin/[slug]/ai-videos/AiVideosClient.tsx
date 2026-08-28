"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  SparklesIcon,
  VideoCameraIcon,
  ArrowDownTrayIcon,
  FilmIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  BoltIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useGenerateVideo, useAICredits, useAIGenerations, useAIGenerationJob } from "@/hooks/useAI";

interface Props {
  companyId: string;
}

export default function AiVideosClient({ companyId }: Props) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [durationSeconds, setDurationSeconds] = useState<number>(5);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const { data: creditsData } = useAICredits();
  const generateVideoMutation = useGenerateVideo();
  const { data: activeJob } = useAIGenerationJob(activeJobId || undefined);
  const { data: generationsData } = useAIGenerations(1, 6, "VIDEO");

  const balance = creditsData?.balance ?? 0;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a description for the video reel.");
      return;
    }

    const estimatedCredits = durationSeconds === 10 ? 100 : 50;
    if (balance < estimatedCredits) {
      toast.error(`Insufficient AI credits. Required: ${estimatedCredits}, Available: ${balance}. Please top up your wallet.`);
      return;
    }

    try {
      const res = await generateVideoMutation.mutateAsync({
        prompt: prompt.trim(),
        durationSeconds,
        aspectRatio,
        modelId: "salesman-video-v1",
      });

      if (res && res.jobId) {
        setActiveJobId(res.jobId);
        toast.success("Video generation job queued! Worker is rendering your reel in background.");
      }
    } catch (error: any) {
      console.error("[VIDEO_GEN_CLIENT_ERROR]", error);
      toast.error(error.message || "Failed to submit video generation job.");
    }
  };

  const currentVideoUrl = activeJob?.outputAssets?.videoUrl || generationsData?.jobs?.[0]?.outputAssets?.videoUrl;

  return (
    <main className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 md:p-6 font-sans overflow-hidden">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 bg-rose-500 rounded-full" />
              <span className="text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Central AI Studio
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FilmIcon className="h-6 w-6 text-rose-500" />
              Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">Reels & Promos.</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl">
            <BoltIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
              {balance.toLocaleString()} Credits
            </span>
          </div>
        </header>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
          {/* Controls Sidebar */}
          <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col shrink-0 overflow-y-auto shadow-sm">
            <form onSubmit={handleGenerate} className="space-y-4 flex-1 flex flex-col">
              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FilmIcon className="h-4 w-4 text-rose-500" />
                  Video Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 360 degree smooth rotation of the titanium luxury watch with dynamic cinematic lighting..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none transition-all"
                />
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4 text-rose-500" />
                  Duration
                </label>
                <select
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:border-rose-500 outline-none"
                >
                  <option value={5}>5 Seconds (~50 Credits)</option>
                  <option value={10}>10 Seconds (~100 Credits)</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ArrowsRightLeftIcon className="h-4 w-4 text-rose-500" />
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "16:9", value: "16:9", desc: "Landscape" },
                    { label: "9:16", value: "9:16", desc: "TikTok/Reel" },
                    { label: "1:1", value: "1:1", desc: "Square" },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value as any)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                        aspectRatio === ratio.value
                          ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-500 text-rose-600 dark:text-rose-400"
                          : "bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-rose-500/50"
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
                disabled={generateVideoMutation.isPending || !prompt.trim()}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {generateVideoMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Queueing Job...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    Generate Video (~{durationSeconds === 10 ? "100" : "50"} Credits)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Video Preview Canvas */}
          <div className="flex-1 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-sm">
            {activeJob && (activeJob.status === "QUEUED" || activeJob.status === "PROCESSING") ? (
              <div className="flex flex-col items-center text-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                  <VideoCameraIcon className="h-8 w-8 text-rose-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeJob.status === "QUEUED" ? "Job Queued in Central Engine" : "Rendering Video Frames..."}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Job ID: <span className="font-mono text-slate-700">{activeJob.id}</span>
                  </p>
                </div>
              </div>
            ) : currentVideoUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative group max-h-full max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
                  <video src={currentVideoUrl} controls autoPlay loop className="max-h-[85vh] max-w-full rounded-2xl" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={currentVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-black/70 hover:bg-black/90 backdrop-blur-md text-white p-2.5 rounded-xl transition-all flex items-center gap-2"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span className="text-xs font-bold pr-1">Download</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-slate-400 max-w-sm">
                <VideoCameraIcon className="h-16 w-16 stroke-1 mb-4 text-slate-300 dark:text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Video Reel Rendered Yet</h3>
                <p className="text-xs">
                  Describe your promotional reel or product rotation prompt on the left to render high-definition marketing videos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}