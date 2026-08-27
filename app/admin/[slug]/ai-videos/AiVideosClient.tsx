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
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

interface Props {
  companyId: string;
}

export default function AiVideosClient({ companyId }: Props) {
  const [prompt, setPrompt] = useState("");
  const [cameraMotion, setCameraMotion] = useState("pan-right");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a description for the video.");
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);

    try {
      // Replace with your actual API endpoint for AI video generation (e.g., Runway, Sora, or Luma API)
      const res = await fetch(`/api/admin/ai/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          cameraMotion,
          aspectRatio,
          companyId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedVideo(data.videoUrl);
        toast.success("Video generated successfully!");
      } else {
        toast.error("Failed to generate video.");
      }
    } catch (error) {
      // Mocking a successful generation for UI testing purposes if API fails
      setTimeout(() => {
        // Using a safe, open-source placeholder video for the mock
        setGeneratedVideo("https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4");
        toast.success("Mock video generated (API route not found).");
        setIsGenerating(false);
      }, 3500); // Videos usually take longer to mock
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedVideo) return;
    toast.success("Downloading video...");
    // Implement actual download logic here (e.g., trigger an anchor tag download)
  };

  return (
    <main className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 md:p-6 font-sans overflow-hidden">
      <Toaster position="top-right"/>

      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                AI Media Studio
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FilmIcon className="h-6 w-6 text-emerald-500"/>
              Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Generation.</span>
            </h1>
          </div>
        </header>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
          
          {/* Controls Sidebar */}
          <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col shrink-0 overflow-y-auto shadow-sm">
            <form onSubmit={handleGenerate} className="space-y-5 flex-1 flex flex-col">
              
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <VideoCameraIcon className="h-4 w-4 text-emerald-500"/>
                  Scene Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cinematic drone shot moving through a neon-lit cyberpunk city, rainy night, high detail..."
                  rows={5}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all"
                />
              </div>

              {/* Camera Motion Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-emerald-500"/>
                  Camera Motion
                </label>
                <select
                  value={cameraMotion}
                  onChange={(e) => setCameraMotion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none"
                >
                  <option value="pan-right">Pan Right</option>
                  <option value="pan-left">Pan Left</option>
                  <option value="zoom-in">Zoom In</option>
                  <option value="zoom-out">Zoom Out</option>
                  <option value="orbit">Orbit Around Subject</option>
                  <option value="static">Static Camera</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ArrowsRightLeftIcon className="h-4 w-4 text-emerald-500"/>
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "16:9", value: "16:9", desc: "YouTube" },
                    { label: "9:16", value: "9:16", desc: "TikTok/Reels" },
                    { label: "1:1", value: "1:1", desc: "Square" },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value)}
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
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin"/>
                    Rendering Video...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4"/>
                    Generate Video
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Player / Preview Area */}
          <div className="flex-1 bg-black/5 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden shadow-sm">
            {isGenerating ? (
              <div className="flex flex-col items-center text-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <FilmIcon className="h-8 w-8 text-emerald-500 animate-bounce"/>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Directing the scene</h3>
                  <p className="text-xs text-slate-500 mt-1">Applying {cameraMotion} camera movement...</p>
                </div>
              </div>
            ) : generatedVideo ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden relative group">
                <video
                  src={generatedVideo}
                  autoPlay
                  loop
                  controls
                  className="w-full h-full object-contain"
                />
                
                {/* Hover Overlay Controls (Top Right) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={handleDownload}
                    className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2.5 rounded-xl transition-all flex items-center gap-2 border border-white/10"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4"/>
                    <span className="text-xs font-bold pr-1">Download</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-slate-400 max-w-sm">
                <VideoCameraIcon className="h-16 w-16 stroke-1 mb-4 text-slate-300 dark:text-slate-700"/>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Video Rendered Yet</h3>
                <p className="text-xs">
                  Describe your scene, select your camera movement, and hit generate. Video generation typically takes 30-60 seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}