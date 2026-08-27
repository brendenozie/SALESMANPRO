"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  PlayCircleIcon,
  SparklesIcon,
  FunnelIcon,
  FolderOpenIcon
} from "@heroicons/react/24/outline";

type MediaType = "IMAGE" | "VIDEO";

interface MediaAsset {
  id: string;
  type: MediaType;
  url: string;
  title: string;
  date: string;
}

// Mock data to visualize the layout before hooking up the API
const MOCK_ASSETS: MediaAsset[] = [
  { id: "1", type: "IMAGE", url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800", title: "Cyberpunk Cityscape", date: "Aug 20, 2026" },
  { id: "2", type: "VIDEO", url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800", title: "Cinematic Ocean Waves", date: "Aug 22, 2026" },
  { id: "3", type: "IMAGE", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800", title: "Abstract Gradient", date: "Aug 24, 2026" },
  { id: "4", type: "IMAGE", url: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800", title: "Modern 3D Icon", date: "Aug 25, 2026" },
];

interface Props {
  companyId: string;
}

export default function AiMediaLibraryClient({ companyId }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MediaType | "ALL">("ALL");

  const filteredAssets = MOCK_ASSETS.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || asset.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (assetTitle: string) => {
    toast.success(`Downloading ${assetTitle}...`);
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
                AI Media Studio
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FolderOpenIcon className="h-6 w-6 text-emerald-500" />
              Generated <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Library.</span>
            </h1>
          </div>
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
                placeholder="Search assets by prompt or title..."
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
                  {f === "IMAGE" && <PhotoIcon className="h-3.5 w-3.5" />}
                  {f === "VIDEO" && <VideoCameraIcon className="h-3.5 w-3.5" />}
                  {f === "ALL" && <SparklesIcon className="h-3.5 w-3.5" />}
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
              {filteredAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="group relative bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col hover:border-emerald-500/50 transition-colors"
                >
                  {/* Media Preview container */}
                  <div className="relative aspect-square w-full bg-black/5 dark:bg-black/20 overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Video Overlay Indicator */}
                    {asset.type === "VIDEO" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <PlayCircleIcon className="h-10 w-10 text-white opacity-90 shadow-sm" />
                      </div>
                    )}
                    
                    {/* Hover Actions Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button 
                        onClick={() => handleDownload(asset.title)}
                        className="p-1.5 bg-white/20 hover:bg-emerald-500 text-white rounded-lg backdrop-blur-sm transition-colors" 
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1.5 bg-white/20 hover:bg-slate-600 text-white rounded-lg backdrop-blur-sm transition-colors" 
                        title="More options"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Meta Info */}
                  <div className="p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {asset.title}
                      </h3>
                      <p className="mt-0.5 text-[10px] font-mono text-slate-500">
                        {asset.date}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                      {asset.type === "IMAGE" ? (
                        <PhotoIcon className="h-3.5 w-3.5" />
                      ) : (
                        <VideoCameraIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredAssets.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <FunnelIcon className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-700 stroke-1" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No media found</h3>
                <p className="text-xs max-w-sm">
                  We couldn't find any generated assets matching your search and filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}