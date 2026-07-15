"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowDownLeftIcon, 
  QrCodeIcon, 
  ShieldCheckIcon,
  ArchiveBoxArrowDownIcon,
  ClockIcon,
  PrinterIcon,
  CheckBadgeIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";

interface ReturnLog {
  book: string;
  user: string;
  time: string;
  status: string;
  memberId?: string;
  isDamaged?: boolean;
}

const LibraryReturnsPageClient = ({ schoolId, initialHistory = [] }: { schoolId: string, initialHistory: ReturnLog[] }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [returnId, setReturnId] = useState("");
  const [recentReturns, setRecentReturns] = useState<ReturnLog[]>(initialHistory);
  const [isDamaged, setIsDamaged] = useState(false); 
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Sync theme with local storage & root document class on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("library-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("library-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Safe client-side time formatter to avoid SSR hydration mismatch
  const formatTimeAgo = (timeString: string) => {
    if (!mounted) return "";
    try {
      return formatDistanceToNow(new Date(timeString), { addSuffix: true });
    } catch (e) {
      return "";
    }
  };

  // Print Functionality
  const handlePrint = (item: ReturnLog) => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return toast.error("Pop-up blocked. Please allow pop-ups to print receipts.");

    const html = `
      <html>
        <head>
          <title>Return Receipt - ${item.book}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #333; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 1.2rem; font-weight: bold; text-transform: uppercase; }
            .item { margin-bottom: 10px; display: flex; justify-content: space-between; }
            .footer { margin-top: 30px; border-top: 1px solid #eee; pt-10px; font-size: 0.8rem; text-align: center; color: #777; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Library Archive</div>
            <div>Return Confirmation</div>
          </div>
          <div class="item"><strong>Date:</strong> <span>${new Date(item.time).toLocaleString()}</span></div>
          <div class="item"><strong>Book:</strong> <span>${item.book}</span></div>
          <div class="item"><strong>Member:</strong> <span>${item.user}</span></div>
          <div class="item"><strong>Status:</strong> <span>${item.status.toUpperCase()}</span></div>
          <div class="footer">
            <p>Thank you for returning your volume on time.</p>
            <p>Ref: ${Math.random().toString(36).substring(2, 11).toUpperCase()}</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnId) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/admin/library/issuance/return-scan?companyId=${schoolId}`, {
        method: "POST",
        body: JSON.stringify({ identifier: returnId }),
        headers: { "Content-Type": "application/json" }
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Volume successfully restored!");
        const newEntry: ReturnLog = {
          book: result.data.bookTitle,
          user: result.data.memberName,
          time: new Date().toISOString(),
          status: isDamaged ? "Damaged" : "Restored",
          isDamaged: isDamaged
        };
        setRecentReturns(prev => [newEntry, ...prev]);
        setReturnId("");
        setIsDamaged(false); // Reset toggle state after successful return
      } else {
        toast.error(result.error || "No active issuance found");
      }
    } catch (err) {
      toast.error("System error during processing");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300">
      <Toaster position="bottom-center" />
      
      {/* Dynamic Background Glow */}
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-rose-500/10 dark:bg-rose-500/20 rounded-lg">
                <ArrowDownLeftIcon className="h-4 w-4 text-rose-500 dark:text-rose-400" />
              </div>
              <span className="text-rose-500 dark:text-rose-400 text-[10px] font-black uppercase tracking-[0.2em]">Inbound Logistics</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
              Return <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 dark:from-rose-400 dark:to-orange-400">Processing.</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all text-slate-600 dark:text-slate-400"
            >
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-800">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold">Today</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{recentReturns.length}</p>
              </div>
              <div className="px-4 py-2">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold">Status</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse" /> Operational
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Scan Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm backdrop-blur-sm relative overflow-hidden group transition-all">
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                  <QrCodeIcon className="h-5 w-5 text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
                  Quick Scan
                </h2>
                
                <form onSubmit={handleReturn} className="space-y-4">
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">ISBN or Member ID</label>
                    <input 
                      value={returnId}
                      onChange={(e) => setReturnId(e.target.value)}
                      placeholder="Scan barcode..."
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 focus:border-rose-500/50 dark:focus:border-rose-500/50 rounded-2xl py-5 px-6 text-lg outline-none transition-all font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                      autoFocus
                      disabled={isProcessing}
                    />
                  </div>

                  {/* Damage Report Toggle */}
                  <div 
                    onClick={() => setIsDamaged(!isDamaged)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      isDamaged 
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200' 
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDamaged ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Report Damage</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black">Flag for repair & issue fine</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${isDamaged ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDamaged ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!returnId || isProcessing}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 dark:shadow-none"
                  >
                    {isProcessing ? (
                      <div className="h-5 w-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                        Complete Return
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/5 to-slate-100/50 dark:from-indigo-900/10 dark:to-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-slate-200">Quality Control</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">System automatically calculates fines and updates book availability in real-time.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: History Log */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                24h Return History
              </h3>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {recentReturns.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl opacity-60">
                  <ArchiveBoxIcon className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 dark:text-slate-500 text-sm">Waiting for incoming volumes...</p>
                </div>
              ) : (
                recentReturns.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-5 border rounded-2xl transition-all shadow-sm ${
                    item.isDamaged 
                    ? 'bg-rose-500/5 border-rose-500/20' 
                    : 'bg-white dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        item.isDamaged 
                        ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-500' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {item.isDamaged ? <ExclamationTriangleIcon className="h-5 w-5" /> : <CheckBadgeIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.book}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Member: {item.user}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-600 mb-1 uppercase">
                          {formatTimeAgo(item.time)}
                        </p>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border block text-center ${
                          item.isDamaged 
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20' 
                          : 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-500 border-emerald-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => handlePrint(item)} 
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 rounded-xl transition-all"
                        title="Print Return Slip"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LibraryReturnsPageClient;