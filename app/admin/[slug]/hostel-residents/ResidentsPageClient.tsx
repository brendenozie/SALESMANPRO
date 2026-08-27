"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
  UserCircleIcon, 
  MagnifyingGlassIcon, 
  PhoneIcon, 
  IdentificationIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  ArrowUpRightIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
  InboxIcon
} from "@heroicons/react/24/outline";

interface Props {
  initialResidents: any[];
  schoolId: string;
}

const ResidentsPageClient = ({ initialResidents, schoolId }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [residents, setResidents] = useState(initialResidents);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Close dropdown action menus on outside click
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // Sync Tailwind class with local state
  // useEffect(() => {
  //   const root = window.document.documentElement;
  //   if (darkMode) {
  //     root.classList.add("dark");
  //   } else {
  //     root.classList.remove("dark");
  //   }
  // }, [darkMode]);

  const handleCheckOut = async (userId: string) => {
    if (!confirm("Check out this resident? This action frees up bed space immediately.")) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/hostel/residents/checkout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        toast.success("Resident successfully checked out");
        setResidents(prev => prev.filter(r => r.id !== userId));
      } else {
        toast.error("Checkout action failed");
      }
    } catch (error) {
      toast.error("Network connection failure");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredResidents = residents.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 transition-colors duration-200 font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Dynamic Native Toaster Layout */}
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            background: darkMode ? '#0f172a' : '#ffffff', 
            color: darkMode ? '#f1f5f9' : '#0f172a', 
            border: darkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
            borderRadius: '1rem',
            fontSize: '12px',
            fontWeight: 'bold'
          } 
        }} 
      />
      
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Dynamic Context Header Utility */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Occupants: {residents.length} Checked In
            </span>
          </div>
          
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
            aria-label="Toggle structural theme layout"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button> */}
        </div>

        {/* Master Control Header Panel */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.75rem] p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Administrative Console</span>
            </div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Resident Directory
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-400 max-w-sm font-medium">
              Manage live active statuses, execute building transfers, and review physical medical parameters.
            </p>
          </div>

          {/* Search Inputs and Controls Panel */}
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-grow xl:w-80">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, room or ID..." 
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-850 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-850">
              <FunnelIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Bento Board Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredResidents.map((resident) => (
            <div 
              key={resident.id} 
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm transition-all duration-200 hover:border-slate-350 dark:hover:border-slate-700"
            >
              {/* Clean solid state indicator badge */}
              <div className="absolute top-6 right-6 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950">
                <span className={`h-1.5 w-1.5 rounded-full ${resident.status === 'In-House' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {resident.status || 'Active'}
                </span>
              </div>

              <div>
                {/* Profile Identity Blocks */}
                <div className="flex items-start gap-4 mb-6 pt-2">
                  <div className="relative">
                    <div className="h-16 w-16 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-850">
                       <UserCircleIcon className="h-10 w-10 text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center text-white border-2 border-white dark:border-slate-900">
                      <IdentificationIcon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-950 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {resident.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                      {resident.studentId}
                    </p>
                    <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                      <MapPinIcon className="h-2.5 w-2.5" />
                      Grade {resident.grade}
                    </div>
                  </div>
                </div>

                {/* Info Panel Cells */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Room Assignment</p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">Suite {resident.room}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Medical Class</p>
                    <p className="text-sm font-black text-rose-600 dark:text-rose-500">{resident.bloodGroup || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Grid Context Controls */}
              <div className="mt-auto flex items-center gap-2">
                <a 
                  href={`tel:${resident.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  <PhoneIcon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  Contact
                </a>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === resident.id ? null : resident.id);
                    }}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>

                  {openMenuId === resident.id && (
                    <div className="absolute right-0 bottom-full mb-3 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg z-50 py-2 overflow-hidden">
                      <button className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                        View Dossier <ArrowUpRightIcon className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                      <button className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                        Transfer Room <ArrowUpRightIcon className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                      <div className="mx-3 my-1.5 border-t border-slate-150 dark:border-slate-800" />
                      <button 
                        onClick={() => handleCheckOut(resident.id)}
                        disabled={isProcessing}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-600 dark:text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors uppercase"
                      >
                        {isProcessing ? "Processing..." : "Check Out"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic State Empty Indicator */}
        {filteredResidents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
            <div className="h-14 w-14 bg-slate-100 dark:bg-slate-950 rounded-2xl flex items-center justify-center mb-4">
              <InboxIcon className="h-6 w-6 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No occupant records found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xs mt-1">
              Adjust your search keywords or parameters to find the designated user ledger.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResidentsPageClient;