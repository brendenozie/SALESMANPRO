"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  MoonIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface ReturnLog {
  book: string;
  user: string;
  time: string;
  status: string;
  memberId?: string;
  isDamaged?: boolean;
}

interface LibraryReturnsPageClientProps {
  schoolId: string;
  initialHistory?: ReturnLog[];
}

export default function LibraryReturnsPageClient({ 
  schoolId, 
  initialHistory = [] 
}: LibraryReturnsPageClientProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [returnId, setReturnId] = useState("");
  const [recentReturns, setRecentReturns] = useState<ReturnLog[]>(initialHistory);
  const [isDamaged, setIsDamaged] = useState(false); 
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync theme with local storage & document root
  useEffect(() => {
    const savedTheme = localStorage.getItem("library-theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("library-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Safe client-side time formatter
  const formatTimeAgo = (timeString: string) => {
    if (!mounted) return "";
    try {
      return formatDistanceToNow(new Date(timeString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  // Filtered return logs based on user search
  const filteredReturns = useMemo(() => {
    if (!searchFilter.trim()) return recentReturns;
    const term = searchFilter.toLowerCase();
    return recentReturns.filter(
      (item) =>
        item.book.toLowerCase().includes(term) ||
        item.user.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
    );
  }, [recentReturns, searchFilter]);

  // Real-time log stats
  const stats = useMemo(() => {
    const total = recentReturns.length;
    const damaged = recentReturns.filter((r) => r.isDamaged).length;
    const restored = total - damaged;
    return { total, restored, damaged };
  }, [recentReturns]);

  // Thermal/Standard Print Receipt Generator
  const handlePrint = (item: ReturnLog) => {
    const printWindow = window.open("", "_blank", "width=600,height=650");
    if (!printWindow) return toast.error("Pop-up blocked. Please enable pop-ups to print receipts.");

    const receiptRef = Math.random().toString(36).substring(2, 10).toUpperCase();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Return Receipt - ${item.book}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Courier New', Courier, monospace; padding: 30px; color: #111827; background: #fff; line-height: 1.4; font-size: 13px; }
            .receipt { border: 1px dashed #9ca3af; padding: 20px; border-radius: 8px; max-width: 380px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
            .title { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .subtitle { font-size: 11px; text-transform: uppercase; color: #4b5563; margin-top: 4px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .label { font-weight: bold; color: #374151; }
            .val { text-align: right; max-width: 200px; word-break: break-word; }
            .badge { display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; border-radius: 4px; border: 1px solid #000; text-transform: uppercase; }
            .divider { border-top: 1px dashed #d1d5db; margin: 15px 0; }
            .footer { text-align: center; font-size: 10px; color: #6b7280; margin-top: 20px; }
            @media print { body { padding: 0; } .receipt { border: none; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="title">Library System</div>
              <div class="subtitle">Official Return Voucher</div>
            </div>
            <div class="row"><span class="label">Receipt ID:</span><span class="val font-mono">#${receiptRef}</span></div>
            <div class="row"><span class="label">Date/Time:</span><span class="val">${new Date(item.time).toLocaleString()}</span></div>
            <div class="divider"></div>
            <div class="row"><span class="label">Item Title:</span><span class="val" style="font-weight: bold;">${item.book}</span></div>
            <div class="row"><span class="label">Patron:</span><span class="val">${item.user}</span></div>
            <div class="row"><span class="label">Condition:</span><span class="val"><span class="badge">${item.status}</span></span></div>
            <div class="divider"></div>
            <div class="footer">
              <p>Thank you for returning library property promptly.</p>
              <p style="margin-top:4px;">Institutional Quality Control Sync'd</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnId.trim()) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/admin/library/issuance/return-scan?companyId=${schoolId}`, {
        method: "POST",
        body: JSON.stringify({ identifier: returnId.trim() }),
        headers: { "Content-Type": "application/json" }
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Volume successfully restored!");
        const newEntry: ReturnLog = {
          book: result.data?.bookTitle || "Returned Title",
          user: result.data?.memberName || "Patron",
          time: new Date().toISOString(),
          status: isDamaged ? "Damaged" : "Restored",
          isDamaged: isDamaged
        };
        setRecentReturns((prev) => [newEntry, ...prev]);
        setReturnId("");
        setIsDamaged(false);
      } else {
        toast.error(result.error || "No active issuance found for this code");
      }
    } catch {
      toast.error("Network communication error during processing");
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 font-sans transition-colors duration-500 relative overflow-x-hidden">
      <Toaster position="top-right" />
      
      {/* Decorative Background Glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
                <ArrowDownLeftIcon className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="text-rose-600 dark:text-rose-400 text-[11px] font-black uppercase tracking-[0.2em]">Inbound Logistics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Return <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 dark:from-rose-400 dark:via-orange-400 dark:to-amber-400">Processing.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Automated volume recovery, fine tracking, and inventory check-in.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Switcher Button */}
            <button 
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm transition-all active:scale-95"
            >
              {mounted && theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-amber-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-indigo-600" />
              )}
            </button>

            {/* Quick System Badge */}
            <div className="flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Scanner Ready</span>
            </div>
          </div>
        </header>

        {/* Dynamic Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Check-Ins</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
              <ArchiveBoxIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Pristine Volumes</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.restored}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <CheckBadgeIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Flagged Damaged</p>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.damaged}</p>
            </div>
            <div className="p-3 bg-rose-500/10 dark:bg-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Scan Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-none backdrop-blur-lg relative overflow-hidden transition-all">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <QrCodeIcon className="h-5 w-5 text-rose-500" />
                  Quick Scan Console
                </h2>
                <SparklesIcon className="h-5 w-5 text-amber-500/70 animate-pulse" />
              </div>
              
              <form onSubmit={handleReturn} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">
                    ISBN Barcode or Patron ID
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      ref={inputRef}
                      value={returnId}
                      onChange={(e) => setReturnId(e.target.value)}
                      placeholder="Scan or type barcode..."
                      className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-700 focus:border-rose-500 dark:focus:border-rose-500 rounded-2xl py-4 pl-5 pr-12 text-base sm:text-lg font-mono outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                      autoFocus
                      disabled={isProcessing}
                    />
                    {returnId && (
                      <button
                        type="button"
                        onClick={() => setReturnId("")}
                        className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Damage Report Toggle */}
                <div 
                  onClick={() => setIsDamaged(!isDamaged)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                    isDamaged 
                      ? 'bg-rose-500/10 border-rose-500/50 text-rose-900 dark:text-rose-200 shadow-sm' 
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-colors ${isDamaged ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                      <ExclamationTriangleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Report Damage</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Flag for repairs & assess penalties</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDamaged ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${isDamaged ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>

                {/* Submit Action Button */}
                <button 
                  type="submit"
                  disabled={!returnId.trim() || isProcessing}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg dark:shadow-none"
                >
                  {isProcessing ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                      Complete Return
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quality Assurance Card */}
            <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Quality Control Guarantee</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Automated fine assessment triggers instant notifications to member portals upon return completion.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: Recent Returns Log */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Log Header & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-slate-400" />
                Recent Check-Ins Log
              </h3>

              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter log entries..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-900 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500/40 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Scrollable Returns List */}
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {filteredReturns.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl">
                  <ArchiveBoxIcon className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No recent returns found</p>
                  <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Scan a volume barcode above to begin</p>
                </div>
              ) : (
                filteredReturns.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border rounded-2xl transition-all gap-4 shadow-sm hover:shadow-md ${
                      item.isDamaged 
                        ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' 
                        : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        item.isDamaged 
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {item.isDamaged ? (
                          <ExclamationTriangleIcon className="h-5 w-5" />
                        ) : (
                          <CheckBadgeIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.book}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Patron: <span className="font-semibold">{item.user}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border inline-block ${
                          item.isDamaged 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}>
                          {item.status}
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                          {formatTimeAgo(item.time)}
                        </p>
                      </div>

                      <button 
                        onClick={() => handlePrint(item)} 
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-rose-600 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl transition-all shadow-sm"
                        title="Print Return Voucher"
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
}