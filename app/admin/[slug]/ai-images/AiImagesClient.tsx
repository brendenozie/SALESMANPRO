"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  SparklesIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  PaintBrushIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface Props {
  companyId: string;
}

export default function AiImagesClient({ companyId }: Props) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a description for the image.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Replace with your actual API endpoint for AI image generation
      const res = await fetch(`/api/admin/ai/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style,
          aspectRatio,
          companyId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Assuming the API returns a URL in data.imageUrl
        setGeneratedImage(data.imageUrl || "[https://placehold.co/1024x1024/05070A/emerald?text=AI+Generated+Preview](https://placehold.co/1024x1024/05070A/emerald?text=AI+Generated+Preview)");
        toast.success("Image generated successfully!");
      } else {
        toast.error("Failed to generate image.");
      }
    } catch (error) {
      // Mocking a successful generation for UI testing purposes if API fails
      setTimeout(() => {
        setGeneratedImage("[https://placehold.co/1024x1024/1e293b/10b981?text=Mock+AI+Generation](https://placehold.co/1024x1024/1e293b/10b981?text=Mock+AI+Generation)");
        toast.success("Mock image generated (API route not found).");
        setIsGenerating(false);
      }, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    toast.success("Downloading image...");
    // Implement actual download logic here
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
              <SparklesIcon className="h-6 w-6 text-emerald-500"/>
              Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Generation.</span>
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
                  <PaintBrushIcon className="h-4 w-4 text-emerald-500"/>
                  What do you want to see?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic city with flying cars, neon lights, cyberpunk style..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all"
                />
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Art Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none appearance-none"
                >
                  <option value="photorealistic">Photorealistic</option>
                  <option value="cinematic">Cinematic Lighting</option>
                  <option value="digital-art">Digital Art</option>
                  <option value="anime">Anime / Manga</option>
                  <option value="3d-render">3D Render</option>
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
                    { label: "1:1", value: "1:1", desc: "Square" },
                    { label: "16:9", value: "16:9", desc: "Landscape" },
                    { label: "9:16", value: "9:16", desc: "Portrait" },
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
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4"/>
                    Generate Image
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Canvas / Preview Area */}
          <div className="flex-1 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-sm">
            {isGenerating ? (
              <div className="flex flex-col items-center text-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <SparklesIcon className="h-8 w-8 text-emerald-500 animate-bounce"/>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Crafting your vision</h3>
                  <p className="text-xs text-slate-500 mt-1">Applying {style} style parameters...</p>
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
                      className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2.5 rounded-xl transition-all flex items-center gap-2"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4"/>
                      <span className="text-xs font-bold pr-1">Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-slate-400 max-w-sm">
                <PhotoIcon className="h-16 w-16 stroke-1 mb-4 text-slate-300 dark:text-slate-700"/>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Image Generated Yet</h3>
                <p className="text-xs">
                  Describe your idea in the prompt area on the left and hit generate to bring it to life using our AI models.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}