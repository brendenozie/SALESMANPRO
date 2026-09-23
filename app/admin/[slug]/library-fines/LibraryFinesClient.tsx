"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  ShieldExclamationIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  FunnelIcon,
  SparklesIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface Fine {
  id: string;
  member: string;
  memberId?: string;
  book: string;
  daysOverdue: number;
  amount: number;
  status: 'Paid' | 'Unpaid';
}

interface LibraryFinesClientProps {
  initialFines?: Fine[];
  schoolId?: string;
}

export default function LibraryFinesClient({ 
  initialFines = [], 
  schoolId = '' 
}: LibraryFinesClientProps) {
  const [fines, setFines] = useState<Fine[]>(initialFines);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unpaid' | 'Paid'>('All');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isWaiverOpen, setIsWaiverOpen] = useState(false);
  const [selectedMemberForWaiver, setSelectedMemberForWaiver] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Sync theme with local storage & document element on mount
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

  // Dashboard Stats
  const stats = useMemo(() => {
    const unpaid = fines.filter(f => f.status === 'Unpaid');
    const paid = fines.filter(f => f.status === 'Paid');
    const totalUnpaid = unpaid.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCollected = paid.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalUnpaid,
      totalCollected,
      unpaidCount: unpaid.length,
      paidCount: paid.length,
      totalCount: fines.length
    };
  }, [fines]);

  // Filtered fines list based on search bar & status tab selector
  const filteredFines = useMemo(() => {
    return fines.filter(f => {
      const matchesSearch = 
        f.member.toLowerCase().includes(search.toLowerCase()) || 
        f.book.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [fines, search, statusFilter]);

  // Unique list of members with active unpaid fines
  const membersWithUnpaidFines = useMemo(() => {
    const uniqueMembers = new Map<string, string>();
    fines.forEach(f => {
      if (f.status === 'Unpaid') {
        uniqueMembers.set(f.member, f.memberId || f.member);
      }
    });
    return Array.from(uniqueMembers.entries()).map(([name, id]) => ({ name, id }));
  }, [fines]);

  // Single settlement action
  const handleCollectPayment = async (fineId: string) => {
    setIsProcessing(fineId);
    try {
      const res = await fetch(`/api/admin/library/fines`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fineId })
      });

      if (res.ok) {
        setFines(prev => prev.map(f => f.id === fineId ? { ...f, status: 'Paid' } : f));
        toast.success("Transaction recorded and balance cleared.");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Could not process payment.");
      }
    } catch {
      toast.error("Network connectivity issue.");
    } finally {
      setIsProcessing(null);
    }
  };

  // Bulk Waiver Protocol
  const handleBulkWaiver = async (memberIdOrName: string, displayName: string) => {
    if (!confirm(`Are you sure you want to waive ALL pending fines for ${displayName}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/library/fines/bulk-waiver?memberId=${memberIdOrName}&companyId=${schoolId}`, {
        method: "PATCH",
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(result.message || `Fines successfully waived for ${displayName}`);
        
        setFines(prev => prev.map(f => {
          const isTargetMember = f.memberId === memberIdOrName || f.member === displayName;
          return isTargetMember ? { ...f, status: 'Paid' } : f;
        }));
        setIsWaiverOpen(false);
        setSelectedMemberForWaiver("");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Waiver processing failed.");
      }
    } catch {
      toast.error("Waiver protocol request failed.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10 font-sans transition-colors duration-500 relative overflow-x-hidden">
      <Toaster position="top-right" />
      
      {/* Background Ambient Glowing Orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/3 w-[600px] h-[600px] bg-yellow-500/10 dark:bg-yellow-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-600 dark:text-amber-400 text-[11px] font-black uppercase tracking-[0.2em]">
                Archive Penalties & Settlements
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Revenue <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400">Ledger.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Manage overdue book fees, waiver protocols, and real-time fine collections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500/30 text-slate-600 dark:text-slate-300 shadow-sm transition-all active:scale-95"
            >
              {mounted && theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-amber-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-indigo-600" />
              )}
            </button>

            {/* Waiver Modal Trigger Button */}
            <button 
              onClick={() => setIsWaiverOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-md"
            >
              <ReceiptPercentIcon className="h-4 w-4 text-amber-400 dark:text-amber-600" />
              <span>Waiver Console</span>
            </button>
          </div>
        </header>

        {/* Dynamic Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Outstanding Balance</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                ${stats.totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                {stats.unpaidCount} Pending Fine{stats.unpaidCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
              <BanknotesIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Settled</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ${stats.totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                {stats.paidCount} Cleared Record{stats.paidCount === 1 ? '' : 's'}
              </p>
            </div>
            <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <CheckBadgeIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm backdrop-blur-md sm:col-span-2 lg:col-span-1 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Audit Log Entries</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {stats.totalCount}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                Active System Records
              </p>
            </div>
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
              <SparklesIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96 group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patron or book title..."
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-amber-500 dark:focus:border-amber-500 rounded-2xl py-3.5 pl-12 pr-10 text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white shadow-sm"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto shadow-sm">
            <FunnelIcon className="h-4 w-4 text-slate-400 ml-2 hidden sm:block" />
            {(['All', 'Unpaid', 'Paid'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === status 
                    ? 'bg-amber-500 text-black shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {status === 'All' ? 'All Fines' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Fines Item List */}
        <div className="space-y-3">
          {filteredFines.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <ShieldExclamationIcon className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No penalty records found</p>
              <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Try updating your search query or filter</p>
            </div>
          ) : (
            filteredFines.map((fine) => (
              <div 
                key={fine.id} 
                className={`group relative overflow-hidden bg-white dark:bg-slate-900/40 border rounded-3xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-md ${
                  fine.status === 'Paid' 
                    ? 'border-slate-200 dark:border-slate-800/60 opacity-95' 
                    : 'border-amber-200/80 dark:border-amber-500/20 hover:border-amber-400/50 dark:hover:border-amber-500/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left Column: Member & Book Details */}
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center border flex-shrink-0 ${
                      fine.status === 'Paid' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}>
                      {fine.status === 'Paid' ? (
                        <CheckBadgeIcon className="h-7 w-7" />
                      ) : (
                        <ShieldExclamationIcon className="h-7 w-7" />
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                        {fine.member}
                        {fine.status === 'Unpaid' && (
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                        )}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Volume: <span className="font-semibold italic text-slate-700 dark:text-slate-300">"{fine.book}"</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Overdue Audit, Balance, Actions */}
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 sm:gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                    
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <ClockIcon className="h-3 w-3 inline" /> Delay
                      </p>
                      <p className="text-xs sm:text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                        {fine.daysOverdue} Days
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
                        Balance
                      </p>
                      <p className={`text-lg sm:text-xl font-black ${
                        fine.status === 'Paid' 
                          ? 'text-slate-400 dark:text-slate-500 line-through' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        ${fine.amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {fine.status === 'Unpaid' ? (
                        <>
                          <button 
                            onClick={() => handleCollectPayment(fine.id)}
                            disabled={isProcessing === fine.id}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-xs shadow-sm disabled:opacity-50"
                          >
                            {isProcessing === fine.id ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <CreditCardIcon className="h-4 w-4" />
                            )}
                            <span>{isProcessing === fine.id ? "Syncing..." : "Settle"}</span>
                          </button>

                          <button 
                            onClick={() => handleBulkWaiver(fine.memberId || fine.member, fine.member)}
                            className="p-2.5 bg-slate-100 hover:bg-rose-500/10 dark:bg-slate-800 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl transition-all shadow-sm"
                            title="Trigger Member Waiver Protocol"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                          <CheckBadgeIcon className="h-4 w-4" /> Cleared
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Waiver Modal Protocol Overlay */}
        {isWaiverOpen && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => { setIsWaiverOpen(false); setSelectedMemberForWaiver(""); }}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <ReceiptPercentIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Bulk Waiver Console
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Administrative penalty waiver
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                Waiving outstanding balances will clear all recorded pending fines for the specified library patron in a single operation.
              </p>

              {membersWithUnpaidFines.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    No active members currently have unpaid fines.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">
                      Target Member
                    </label>
                    <select
                      value={selectedMemberForWaiver}
                      onChange={(e) => setSelectedMemberForWaiver(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 outline-none focus:border-amber-500 text-slate-900 dark:text-white text-sm font-medium"
                    >
                      <option value="">-- Select patron --</option>
                      {membersWithUnpaidFines.map((m) => (
                        <option key={m.id} value={m.id} className="text-slate-900 dark:text-white dark:bg-slate-900">
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    disabled={!selectedMemberForWaiver}
                    onClick={() => {
                      const target = membersWithUnpaidFines.find(m => m.id === selectedMemberForWaiver);
                      if (target) handleBulkWaiver(target.id, target.name);
                    }}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-md"
                  >
                    <UserIcon className="h-4 w-4" />
                    Waive Selected Fines
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}