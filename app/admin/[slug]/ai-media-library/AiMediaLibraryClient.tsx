"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowDownTrayIcon,
  FolderOpenIcon,
  ArrowPathIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAIGenerations } from "@/hooks/useAI";

interface Props {
  companyId: string;
}

export default function AiMediaLibraryClient({ companyId }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");

  const { data: generationsData, isLoading, refetch } = useAIGenerations(
    1,
    50,
    filter === "ALL" ? undefined : filter,
  );

  const jobs = generationsData?.jobs || [];

  const filteredAssets = jobs.filter((job: any) => {
    const promptText = job.prompt || "";
    return promptText.toLowerCase().includes(search.toLowerCase());
  });

  const handleDownload = (url: string, filename: string) => {
    window.open(url, "_blank");
    toast.success(`Opening ${filename}...`);
  };

  return (
    <main className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 md:p-6 font-sans flex flex-col">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto w-full h-full flex flex-col min-h-0">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Central Media Architecture
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FolderOpenIcon className="h-6 w-6 text-emerald-500" />
              AI Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Library.</span>
            </h1>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </header>

        {/* Main Work Area */}
        <div className="flex-1 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-0">
          {/* Top Bar: Search & Filters */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search assets by prompt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
              {(["ALL", "IMAGE", "VIDEO"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    filter === f
                      ? "bg-emerald-500 text-black shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {f === "IMAGE" && <PhotoIcon className="h-3 w-3" />}
                  {f === "VIDEO" && <VideoCameraIcon className="h-3 w-3" />}
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 gap-2">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Loading media records from central ledger...</span>
              </div>
            ) : filteredAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAssets.map((job: any) => {
                  const mediaUrl = job.outputAssets?.videoUrl || job.outputAssets?.images?.[0]?.url;
                  const isVideo = job.capability === "VIDEO";

                  return (
                    <div
                      key={job.id}
                      className="group bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-xs"
                    >
                      <div className="relative aspect-square bg-black/10 dark:bg-black/40 flex items-center justify-center overflow-hidden">
                        {mediaUrl ? (
                          isVideo ? (
                            <video src={mediaUrl} className="w-full h-full object-cover" />
                          ) : (
                            <img src={mediaUrl} alt={job.prompt} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="text-center p-3 text-slate-400 text-xs">
                            <SparklesIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                            <span>{job.status}</span>
                          </div>
                        )}

                        <span
                          className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            job.status === "COMPLETED"
                              ? "bg-emerald-500 text-black"
                              : job.status === "PROCESSING"
                              ? "bg-amber-500 text-black"
                              : "bg-slate-700 text-white"
                          }`}
                        >
                          {job.capability}
                        </span>

                        {mediaUrl && (
                          <button
                            onClick={() => handleDownload(mediaUrl, `ai_asset_${job.id}`)}
                            className="absolute bottom-2.5 right-2.5 p-2 bg-black/70 hover:bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="p-3 space-y-1.5">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                          {job.prompt || "AI Generation Asset"}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          <span>{job.creditsReserved || job.creditsConsumed || 0} Credits</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <FolderOpenIcon className="w-12 h-12 stroke-1 mb-2 text-slate-300 dark:text-slate-700" />
                <p>No generated media found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}