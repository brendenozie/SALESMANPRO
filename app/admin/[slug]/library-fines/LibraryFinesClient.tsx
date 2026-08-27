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
  MoonIcon
} from "@heroicons/react/24/outline";

interface Fine {
  id: string;
  member: string;
  memberId?: string; // Associated internal ID for backend actions
  book: string;
  daysOverdue: number;
  amount: number;
  status: 'Paid' | 'Unpaid';
}

const LibraryFinesClient = ({ initialFines = [], schoolId = '' }: { initialFines: Fine[], schoolId: string }) => {
  const [fines, setFines] = useState<Fine[]>(initialFines);
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isWaiverOpen, setIsWaiverOpen] = useState(false);
  const [selectedMemberForWaiver, setSelectedMemberForWaiver] = useState("");
  
  // Theme state defaulting to 'dark' but syncing with localStorage/system preference on mount
  // const [theme, setTheme] = useState<"light" | "dark">("light");

  // useEffect(() => {
  //   const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  //   if (savedTheme) {
  //     setTheme(savedTheme);
  //   } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  //     setTheme("dark");
  //   } else {
  //     setTheme("light");
  //   }
  // }, []);

  // const toggleTheme = () => {
  //   const nextTheme = theme === "dark" ? "light" : "dark";
  //   setTheme(nextTheme);
  //   localStorage.setItem("theme", nextTheme);
  // };

  // Filters the fines list based on search bar queries
  const filteredFines = useMemo(() => {
    return fines.filter(f => 
      f.member.toLowerCase().includes(search.toLowerCase()) || 
      f.book.toLowerCase().includes(search.toLowerCase())
    );
  }, [fines, search]);

  // Calculates total outstanding unpaid fines dynamically
  const totalOutstanding = useMemo(() => 
    fines.filter(f => f.status === 'Unpaid')
         .reduce((acc, curr) => acc + curr.amount, 0)
  , [fines]);

  // Unique list of members who have unpaid fines (for the bulk waiver selector)
  const membersWithUnpaidFines = useMemo(() => {
    const uniqueMembers = new Map<string, string>(); // name -> memberId (or fallback to name)
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
    } catch (error) {
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
        toast.success(result.message || `Fines waived for ${displayName}`);
        
        // Update local state to reflect the status updates
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
    } catch (error) {
      toast.error("Waiver protocol failed.");
    }
  };

  return (
    <div >
      <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300 relative overflow-hidden">
        <Toaster position="top-right" />
        
        {/* Amber Ambient Glow */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-500/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-12 bg-amber-500 rounded-full" />
                <span className="text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Archive Penalties</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Revenue <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-600">Ledger.</span>
              </h1>
            </div>

            <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
              {/* Theme Switcher Toggle */}
              {/* <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 dark:hover:border-amber-500/30 rounded-2xl transition-all shadow-sm"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <>
                    <SunIcon className="h-5 w-5 text-amber-500" />
                    <span className="text-xs font-semibold text-slate-300">Light Mode</span>
                  </>
                ) : (
                  <>
                    <MoonIcon className="h-5 w-5 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-700">Dark Mode</span>
                  </>
                )}
              </button> */}

              <div className="flex items-center gap-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 lg:p-6 rounded-3xl backdrop-blur-md transition-all hover:border-amber-500/30 shadow-sm dark:shadow-none">
                <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500">
                  <BanknotesIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Outstanding</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2 relative group">
              <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-600 group-focus-within:text-amber-500 transition-colors" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name or book identifier..."
                className="w-full bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-amber-500/50 dark:focus:border-amber-500/50 rounded-2xl py-4 pl-14 pr-6 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white shadow-sm dark:shadow-none"
              />
            </div>
            <button 
              onClick={() => setIsWaiverOpen(true)}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-bold transition-all border border-slate-200 dark:border-slate-700 active:scale-95 py-4 shadow-sm"
            >
              <ReceiptPercentIcon className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              Waiver Protocol
            </button>
          </div>

          {/* Modal: Waiver Protocol Menu */}
          {isWaiverOpen && (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#0b0e14] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full relative shadow-xl">
                <button 
                  onClick={() => { setIsWaiverOpen(false); setSelectedMemberForWaiver(""); }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <ReceiptPercentIcon className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                  Bulk Waiver Console
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Clear all outstanding fines for a selected library user in a single operation. This action cannot be reversed.
                </p>

                {membersWithUnpaidFines.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No active members with outstanding unpaid fines.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Select Member</label>
                      <select
                        value={selectedMemberForWaiver}
                        onChange={(e) => setSelectedMemberForWaiver(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:border-amber-500/50 text-slate-900 dark:text-white text-sm"
                      >
                        <option value="">-- Choose a member --</option>
                        {membersWithUnpaidFines.map((m) => (
                          <option key={m.id} value={m.id} className="text-slate-900 dark:text-white dark:bg-slate-900">{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      disabled={!selectedMemberForWaiver}
                      onClick={() => {
                        const target = membersWithUnpaidFines.find(m => m.id === selectedMemberForWaiver);
                        if (target) handleBulkWaiver(target.id, target.name);
                      }}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <UserIcon className="h-5 w-5" />
                      Waive Selected Fines
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* main fines list */}
          <div className="space-y-3">
            {filteredFines.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl opacity-60">
                <p className="text-slate-400 dark:text-slate-500">No matching fine records found.</p>
              </div>
            ) : (
              filteredFines.map((fine) => (
                <div key={fine.id} className="group relative overflow-hidden bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-sm dark:shadow-none">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    <div className="flex items-center gap-5">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border shadow-inner transition-colors ${
                        fine.status === 'Paid' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500'
                      }`}>
                        {fine.status === 'Paid' ? <CheckBadgeIcon className="h-8 w-8" /> : <ShieldExclamationIcon className="h-8 w-8" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {fine.member}
                          {fine.status === 'Unpaid' && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        </h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500">Vol: <span className="italic text-slate-500 dark:text-slate-400">"{fine.book}"</span></p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 md:gap-12">
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Audit Trail</p>
                        <p className="text-sm font-mono text-slate-600 dark:text-slate-300">{fine.daysOverdue} Days Delay</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Balance</p>
                        <p className={`text-xl font-black ${fine.status === 'Paid' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-amber-600 dark:text-amber-400'}`}>
                          ${fine.amount.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 min-w-[160px] justify-start md:justify-end">
                        {fine.status === 'Unpaid' ? (
                          <>
                            <button 
                              onClick={() => handleCollectPayment(fine.id)}
                              disabled={isProcessing === fine.id}
                              className="flex-grow p-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2 text-xs disabled:opacity-50 shadow-sm"
                            >
                              <CreditCardIcon className="h-4 w-4" />
                              {isProcessing === fine.id ? "Syncing..." : "Settle Balance"}
                            </button>
                            <button 
                              onClick={() => handleBulkWaiver(fine.memberId || fine.member, fine.member)}
                              className="p-3 bg-slate-100 hover:bg-rose-100/70 dark:bg-slate-800 dark:hover:bg-rose-900/30 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl border border-slate-200 dark:border-transparent transition-all shadow-sm"
                              title="Trigger Member Waiver Protocol"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm shadow-emerald-900/5 dark:shadow-emerald-900/20">
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
        </div>
      </main>
    </div>
  );
};

export default LibraryFinesClient;