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
  MapPinIcon
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

  // Close menu on outside click
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

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
        toast.success("Checkout Complete");
        setResidents(prev => prev.filter(r => r.id !== userId));
      }
    } catch (error) {
      toast.error("Network error");
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
    <main className="min-h-screen bg-[#05070A] text-slate-300 p-6 lg:p-12 selection:bg-purple-500/30">
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#0F172A', color: '#fff', border: '1px solid #1E293B' }}} />
      
      <div className="max-w-7xl mx-auto">
        {/* Modern Glass Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Live Ledger</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              Resident <span className="text-slate-500">Directory.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-grow md:w-96">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name, room or ID..." 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-slate-600"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-600 transition-all active:scale-95">
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredResidents.map((resident) => (
            <div 
              key={resident.id} 
              className="group relative bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-8 hover:bg-slate-900/60 hover:border-purple-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/5"
            >
              {/* Status Glow Tip */}
              <div className={`absolute top-8 right-8 h-2 w-2 rounded-full ${resident.status === 'In-House' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />

              <div className="flex flex-col h-full">
                {/* Identity Section */}
                <div className="flex items-start gap-5 mb-8">
                  <div className="relative">
                    <div className="h-20 w-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border border-slate-700 overflow-hidden">
                       <UserCircleIcon className="h-12 w-12 text-slate-600 group-hover:text-purple-500 transition-colors duration-500" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-purple-600 rounded-xl flex items-center justify-center text-white border-4 border-[#05070A]">
                      <IdentificationIcon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-white truncate group-hover:text-purple-400 transition-colors">{resident.name}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{resident.studentId}</p>
                    <div className="inline-flex items-center gap-1.5 mt-3 px-2 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400">
                      <MapPinIcon className="h-3 w-3" />
                      GRADE {resident.grade}
                    </div>
                  </div>
                </div>

                {/* Info Bento Blocks */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/20 rounded-3xl p-5 border border-slate-800/40 group-hover:border-purple-500/20 transition-colors">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-2">Location</p>
                    <p className="text-lg font-black text-white italic tracking-tight leading-none">№ {resident.room}</p>
                  </div>
                  <div className="bg-black/20 rounded-3xl p-5 border border-slate-800/40 group-hover:border-purple-500/20 transition-colors">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-2">Medical</p>
                    <p className="text-lg font-black text-rose-500/80 tracking-tight leading-none">{resident.bloodGroup}</p>
                  </div>
                </div>

                {/* Action Row */}
                <div className="mt-auto flex items-center gap-3">
                  <a 
                    href={`tel:${resident.phone}`}
                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-800 hover:bg-purple-600 text-white rounded-2xl text-xs font-black transition-all group/btn"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    CONTACT
                  </a>
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === resident.id ? null : resident.id);
                      }}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>

                    {openMenuId === resident.id && (
                      <div className="absolute right-0 bottom-full mb-4 w-56 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <button className="w-full flex items-center justify-between px-6 py-3 text-[11px] font-black text-slate-300 hover:bg-slate-800 transition-colors">
                          VIEW DOSSIER <ArrowUpRightIcon className="h-3 w-3" />
                        </button>
                        <button className="w-full flex items-center justify-between px-6 py-3 text-[11px] font-black text-slate-300 hover:bg-slate-800 transition-colors">
                          TRANSFER ROOM <ArrowUpRightIcon className="h-3 w-3" />
                        </button>
                        <div className="mx-4 my-2 border-t border-slate-800" />
                        <button 
                          onClick={() => handleCheckOut(resident.id)}
                          disabled={isProcessing}
                          className="w-full text-left px-6 py-3 text-[11px] text-rose-500 font-black hover:bg-rose-500/10 transition-colors uppercase"
                        >
                          {isProcessing ? "Working..." : "Check Out Resident"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State Redesign */}
        {filteredResidents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 bg-slate-900/10 rounded-[4rem] border-2 border-dashed border-slate-800/50">
            <div className="h-20 w-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
               <MagnifyingGlassIcon className="h-10 w-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No matching records</h3>
            <p className="text-slate-500 text-sm max-w-xs text-center">Try adjusting your filters or search terms to find the resident.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResidentsPageClient;