"use client";

import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
  UserCircleIcon, 
  MagnifyingGlassIcon, 
  PhoneIcon, 
  ShieldCheckIcon, 
  MapPinIcon,
  IdentificationIcon,
  FunnelIcon,
  EllipsisVerticalIcon
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
  

  const handleCheckOut = async (userId: string) => {
    if (!confirm("Are you sure you want to check out this resident? This will free up their bed space.")) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/hostel/residents/checkout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        toast.success("Resident checked out successfully");
        // Update local state to remove the resident from the active list
        setResidents(residents.filter(r => r.id !== userId));
      } else {
        toast.error("Failed to check out resident");
      }
    } catch (error) {
      toast.error("A connection error occurred");
    } finally {
      setIsProcessing(false);
      setOpenMenuId(null);
    }
  };

  // Filter Logic
  const filteredResidents = residents.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const residents = [
  //   { id: 'STU-4401', name: 'Marcus Holloway', room: '101', grade: '12th', bloodGroup: 'O+', parent: 'John Holloway', phone: '+1 555-0234', status: 'In-House' },
  //   { id: 'STU-3922', name: 'Elena Fisher', room: '204', grade: '10th', bloodGroup: 'A-', parent: 'Sarah Fisher', phone: '+1 555-9981', status: 'On-Leave' },
  //   { id: 'STU-4105', name: 'Arthur Morgan', room: '105', grade: '11th', bloodGroup: 'B+', parent: 'Mary Morgan', phone: '+1 555-7762', status: 'In-House' },
  // ];

  return (
    <>    
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-500 rounded-full" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Occupancy Ledger</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Resident <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Directory.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-80">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                  type="text" 
                  placeholder="Search name, room, or ID..." 
                  className="..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

            </div>
            <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Resident Cards Grid */}
        
         {/* Resident Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredResidents.map((resident) => (
          <div key={resident.id} className="group bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-900/50 hover:border-purple-500/30 transition-all relative overflow-hidden">
            
            {/* Profile Section */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-800 rounded-[1.5rem] flex items-center justify-center border border-slate-700">
                   {/* If user has image field: <img src={resident.image} /> */}
                  <UserCircleIcon className="h-10 w-10 text-slate-500 group-hover:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{resident.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-black rounded uppercase">
                      {resident.studentId}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{resident.grade}</span>
                  </div>
                </div>
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === resident.id ? null : resident.id);
                  }}
                  className="text-slate-600 hover:text-white transition-colors p-1"
                >
                  <EllipsisVerticalIcon className="h-6 w-6" />
                </button>

                {openMenuId === resident.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                    <button className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors">
                      View Full Dossier
                    </button>
                    <button className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors">
                      Edit Room Assignment
                    </button>
                    <hr className="my-2 border-slate-800" />
                    <button 
                      onClick={() => handleCheckOut(resident.id)}
                      disabled={isProcessing}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 font-bold transition-colors"
                    >
                      {isProcessing ? "Processing..." : "Check Out Resident"}
                    </button>
                  </div>
                )}
            </div>

            {/* Room & Status */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-black/40 rounded-2xl p-4 border border-slate-800/50">
                <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Assigned Room</p>
                <p className="text-lg font-black text-white italic">Room {resident.room}</p>
              </div>
              <div className="bg-black/40 rounded-2xl p-4 border border-slate-800/50">
                <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Status</p>
                <p className={`text-sm font-bold ${resident.status === 'In-House' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {resident.status}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Parent: {resident.parent}</span>
                <span className="text-rose-400 font-black">{resident.bloodGroup}</span>
              </div>
              <a 
                href={`tel:${resident.phone}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all"
              >
                <PhoneIcon className="h-4 w-4" />
                {resident.phone}
              </a>
            </div>
          </div>
          </div>      
        ))}

      {/* // Empty State */}
      {filteredResidents.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-800">
          <p className="text-slate-500 font-medium">No residents found matching your search.</p>
        </div>
      )}

      </div>
      </div>
     </main>
    </>

  );
};

export default ResidentsPageClient;