"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ArrowDownLeftIcon, 
  QrCodeIcon, 
  HandThumbUpIcon,
  ShieldCheckIcon,
  ArchiveBoxArrowDownIcon,
  ClockIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const LibraryReturnsPageClient = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [returnId, setReturnId] = useState("");

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Volume successfully restored to archive!");
      setReturnId("");
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="bottom-center" />
      
      {/* Background Ambience */}
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-rose-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-rose-500/20 rounded-lg">
              <ArrowDownLeftIcon className="h-4 w-4 text-rose-400" />
            </div>
            <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em]">Inbound Logistics</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white">
            Return <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Processing.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Processing Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <QrCodeIcon className="h-5 w-5 text-slate-400" />
                  Quick Scan
                </h2>
                
                <form onSubmit={handleReturn} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Book ISBN or Member ID</label>
                    <input 
                      value={returnId}
                      onChange={(e) => setReturnId(e.target.value)}
                      placeholder="Scan barcode or type ID..."
                      className="w-full bg-black/40 border border-slate-700 focus:border-rose-500/50 rounded-2xl py-5 px-6 text-lg outline-none transition-all font-mono"
                      autoFocus
                    />
                  </div>
                  <button 
                    disabled={!returnId || isProcessing}
                    className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                        Complete Return
                      </>
                    )}
                  </button>
                </form>
              </div>
              
              {/* Decorative scan lines */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full" />
            </div>

            {/* Shelf Health Card */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/20 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Condition Check</p>
                  <p className="text-xs text-slate-500">Ensure all volumes are inspected for damage before shelving.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Recent Log */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-slate-500" />
                Live Return Feed
              </h3>
              <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-bold">Session: 14 Returns</span>
            </div>

            <div className="space-y-3">
              {[
                { book: "The Alchemist", user: "Sarah Chen", time: "2 mins ago", status: "Perfect Condition" },
                { book: "The Silent Patient", user: "Marcus Wright", time: "15 mins ago", status: "Inspected" },
                { book: "Dune: Part One", user: "Alex Rivera", time: "1 hour ago", status: "Restored" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-900/20 border border-slate-800/40 rounded-2xl hover:bg-slate-900/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-rose-400 transition-colors">
                      <SparklesIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{item.book}</h4>
                      <p className="text-xs text-slate-500">Returned by {item.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-slate-600 mb-1">{item.time}</p>
                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-tighter bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default LibraryReturnsPageClient;