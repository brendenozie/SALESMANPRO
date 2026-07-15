"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon,
  UsersIcon,
  XMarkIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { FloorPlanView } from "./FloorPlanView";
import AddRoomModal from "./AddRoomModal";

interface HostelBlocksPageProps {
  initialBlocks: any[];
  schoolId: string;
}

export default function HostelBlocksPage({ initialBlocks, schoolId }: HostelBlocksPageProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [viewingBlock, setViewingBlock] = useState<any>(null); 
  const [rooms, setRooms] = useState<any[]>([]); 
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search & Selection State
  const [userType, setUserType] = useState<'STUDENT' | 'EDUCATOR'>('STUDENT');
  const [query, setQuery] = useState("");
  const [searchMembersResults, setSearchMembersResults] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Logic
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length < 2) {
        setSearchMembersResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/admin/hostel/residents/search-profiles?companyId=${schoolId}&type=${userType}&q=${query}`);
        const result = await res.json();
        if (res.ok) setSearchMembersResults(result.data || []);
      } catch (err) {
        console.error("Failed fetching profiles", err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, userType, schoolId]);

  const assignResident = async (userId: string) => {
    const res = await fetch(`/api/admin/hostel/allocate`, {
      method: "POST",
      body: JSON.stringify({ roomId: selectedRoom.id, userId }),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      toast.success("Resident allocated successfully");
      setIsAssigning(false);
      openBlock(viewingBlock); 
      setSelectedRoom(null); 
    }
  };

  const handleOnboard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProfile) return toast.error("Select a profile first");
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      profileId: selectedProfile.id,
      type: userType,
      studentId: userType === 'STUDENT' ? selectedProfile.id : null,
      educatorId: userType === 'EDUCATOR' ? selectedProfile.id : null,
      schoolId: schoolId,
      blockId: viewingBlock?.id,
      roomId: selectedRoom?.id,
      companyId: schoolId,
      memberId: formData.get("memberId") ? String(formData.get("memberId")) : selectedProfile.identifier,
    };

    try {
      const res = await fetch(`/api/admin/hostel/residents?companyId=${schoolId}&blockId=${viewingBlock?.id}&roomId=${selectedRoom?.id}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const { data } = await res.json();
        setSearchMembersResults([data, ...searchMembersResults]);
        toast.success(`Identity established for ${selectedProfile.name}`);
        setIsAssigning(false);
        setSelectedProfile(null);
        setQuery("");
        // Refresh room info
        if (selectedRoom) openRoom(selectedRoom);
        openBlock(viewingBlock);
      } else {
        toast.error("User is already a hostel resident");
      }
    } catch (err) {
      toast.error("Integration error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openBlock = async (block: any) => {
    setViewingBlock(block);
    const res = await fetch(`/api/admin/hostel/rooms?blockId=${block.id}`);
    const json = await res.json();
    setRooms(json.data || []);
  };

  const openRoom = async (room: any) => {
    const targetId = room.id || room._id;
    const res = await fetch(`/api/admin/hostel/rooms/${targetId}`);
    const json = await res.json();
    setSelectedRoom(json.data);
  };

  const fetchBlocks = async () => {
    const res = await fetch(`/api/admin/hostel/blocks?companyId=${schoolId}`);
    const json = await res.json();
    setBlocks(json.data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete the block and all associated room data.")) return;
    const res = await fetch(`/api/admin/hostel/blocks?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Block decommissioned");
      fetchBlocks();
    } else {
      toast.error("Clear rooms before deleting block");
    }
  };

  const handleCheckOut = async (allocationId: string) => {
    if (!confirm("Confirm bed vacation of this resident?")) return;
    const res = await fetch('/api/admin/hostel/allocate', {
      method: 'PATCH',
      body: JSON.stringify({ allocationId, status: 'INACTIVE' }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (res.ok) {
      toast.success("Bed vacated successfully");
      if (selectedRoom) openRoom(selectedRoom);
      openBlock(viewingBlock);
    } else {
      toast.error("Error during check-out operational routing.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Dynamic Background Grid Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 dark:bg-indigo-600/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {viewingBlock ? (
        <main className="p-6 md:p-8 max-w-7xl mx-auto relative z-10">
          <button 
            onClick={() => setViewingBlock(null)}
            className="group text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to All Blocks
          </button>
          
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 font-black uppercase tracking-widest text-[10px] rounded-md">
                {viewingBlock.type} BLOCK ARCHITECTURE
              </span>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">{viewingBlock.name}</h1>
            </div>
            <button 
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-purple-400 text-white px-5 py-3 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-95 shadow-md shrink-0"
              onClick={() => { 
                setSelectedRoom(null); 
                setIsRoomModalOpen(true); 
              }}
            >
              + Add New Unit Room
            </button>
          </header>

          {/* Interactive Structural Grid Layout */}
          <div className="bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
            <FloorPlanView rooms={rooms} onEditRoom={(room) => openRoom(room)} />
          </div>

          {/* Interactive Dynamic Slide-over Resident Panel */}
          <div className={`fixed inset-0 z-[70] transition-all duration-300 ${selectedRoom ? "opacity-100 visible" : "opacity-0 invisible"}`}>
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRoom(null)} />
            
            <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0A0C10] border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-500 ease-out flex flex-col justify-between ${selectedRoom ? "translate-x-0" : "translate-x-full"}`}>
              {selectedRoom && (
                <>
                  {/* Drawer Header */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md shadow-purple-500/20">
                        {selectedRoom.roomNumber}
                      </div>
                      <button 
                        onClick={() => setSelectedRoom(null)} 
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Room Specification View</h2>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5">Floor Level {selectedRoom.floor} • Capacity Allocation Metrics</p>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Current Occupants</h3>
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-lg text-[10px] font-black font-mono">
                        {selectedRoom.residents?.length || 0} / {selectedRoom.capacity} Beds Taken
                      </span>
                    </div>

                    <div className="space-y-4">
                      {selectedRoom.residents?.length > 0 ? (
                        selectedRoom.residents.map((resident: any) => (
                          <div 
                            key={resident.allocationId} 
                            className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/60 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-300"
                          >
                            <div className="relative shrink-0">
                              <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-purple-600/10 group-hover:text-purple-500 transition-colors">
                                <UserCircleIcon className="h-6 w-6" />
                              </div>
                              <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#0A0C10] ${resident.type === 'STUDENT' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{resident.name}</p>
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold tracking-tighter uppercase">
                                  {resident.type}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                Allocated: {resident.joinedAt ? new Date(resident.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                              </p>
                            </div>

                            <button 
                              onClick={() => handleCheckOut(resident.allocationId)}
                              className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500 dark:text-rose-400 dark:hover:text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
                            >
                              Vacate
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10">
                          <UsersIcon className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                          <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">No Active Residents</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/40 grid grid-cols-2 gap-4">
                    <button className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
                      <WrenchScrewdriverIcon className="h-4 w-4" /> Logistics
                    </button>
                    <button 
                      onClick={() => setIsAssigning(true)} 
                      className="py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-900/10"
                    >
                      Assign Resident
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Independent Onboarding Sub-Modal Dialog */}
          {isAssigning && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-[#05070A]/80 backdrop-blur-md">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Establish Resident Identity</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Assign asset units to profile matrices</p>
                  </div>
                  <button onClick={() => { setIsAssigning(false); setSelectedProfile(null); setQuery(""); }} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
    
                <div className="px-6 pt-6">
                  <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                    {(['STUDENT', 'EDUCATOR'] as const).map(type => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => { setUserType(type); setSelectedProfile(null); setSearchMembersResults([]); setQuery(""); }}
                        className={`flex-1 py-2 rounded-lg text-xs font-black tracking-wide transition-all ${userType === type ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        {type === 'STUDENT' ? 'Students' : 'Faculty / Staff'}
                      </button>
                    ))}
                  </div>
                </div>
    
                <form onSubmit={handleOnboard} className="p-6 space-y-5">
                  {!selectedProfile ? (
                    <div className="relative">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Search Database Profile</label>
                      <div className="relative mt-2">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={`Type to search ${userType.toLowerCase()}s...`}
                          className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-purple-500 transition-all text-sm text-slate-900 dark:text-white" 
                        />
                      </div>
                      
                      {searchMembersResults.length > 0 && (
                        <div className="absolute z-[90] w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                          {searchMembersResults.map(res => (
                            <div 
                              key={res.id} 
                              onClick={() => setSelectedProfile(res)}
                              className="p-3.5 hover:bg-purple-50 dark:hover:bg-purple-500/10 cursor-pointer flex justify-between items-center transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{res.name}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{res.identifier}</p>
                              </div>
                              <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-500 shrink-0" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedProfile.name}</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{selectedProfile.identifier}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelectedProfile(null)} className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">Change</button>
                    </div>
                  )}
    
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Archive Hostel Member System ID</label>
                    <input 
                      name="memberId" 
                      required 
                      defaultValue={selectedProfile?.identifier || ""}
                      placeholder="e.g., HST-IDENTIFIER" 
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 mt-2 outline-none focus:border-purple-500 transition-all text-sm text-slate-900 dark:text-white font-mono uppercase" 
                    />
                  </div>
    
                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      type="button" 
                      onClick={() => { setIsAssigning(false); setSelectedProfile(null); setQuery(""); }}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !selectedProfile}
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-400 dark:disabled:bg-purple-900/40 dark:disabled:text-slate-500 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-purple-900/10"
                    >
                      {isSubmitting ? "Syncing Integration..." : "Confirm Assignment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* Root Overview Dashboard Track */
        <main className="p-6 md:p-8 max-w-7xl mx-auto relative z-10">          
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Infrastructure <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-400">Blocks.</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage modular operational facilities, wings, and structural assets</p>
            </div>
            <button 
              onClick={() => { setSelectedBlock(null); setIsModalOpen(true); }}
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl font-bold text-xs tracking-wide flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-900/10 shrink-0"
            >
              <PlusIcon className="h-4 w-4" /> Create Infrastructure Block
            </button>
          </header>

          {/* High-End Bento Block Layout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map((block: any) => (
              <div key={block.id} className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                {/* Type Tag Accent */}
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 rounded-bl-xl border-l border-b border-slate-200/40 dark:border-slate-700/30">
                  {block.type}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-500/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm shrink-0">
                    <BuildingOfficeIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{block.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{block.roomCount || 0} Total Allocated Units</p>
                  </div>
                </div>

                {/* Sub-Bento Aggregation Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-black/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Total Capacity</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{block.totalCapacity || 0}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Current Occupants</p>
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">{block.totalOccupancy || 0}</p>
                  </div>
                </div>

                {/* Micro Action Utility Bar */}
                <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <button 
                    onClick={() => { setSelectedBlock(block); setIsModalOpen(true); }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700/50"
                  >
                    <PencilSquareIcon className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => openBlock(block)}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all text-center shadow-md shadow-purple-900/5"
                  >
                    View Layout Rooms
                  </button>
                  <button 
                    onClick={() => handleDelete(block.id)}
                    className="px-3 py-2.5 bg-rose-50 hover:bg-rose-500 dark:bg-rose-500/10 dark:hover:bg-rose-500 text-rose-600 dark:text-rose-400 dark:hover:text-white rounded-lg transition-all border border-rose-200/30 dark:border-transparent"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Infrastructure Create/Edit Block Center Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              {selectedBlock ? "Modify" : "Create"} Structural <span className="text-purple-500">Block.</span>
            </h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get("name"),
                type: formData.get("type"),
                companyId: schoolId
              };

              const method = selectedBlock ? "PUT" : "POST";
              const res = await fetch(`/api/admin/hostel/blocks${selectedBlock ? `?id=${selectedBlock.id}` : ''}`, {
                method,
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
              });

              if (res.ok) {
                toast.success("Structural infrastructure matrix updated");
                setIsModalOpen(false);
                fetchBlocks();
              } else {
                toast.error("An operational pipeline bottleneck occurred.");
              }
            }} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Block Name Configuration</label>
                <input 
                  name="name" 
                  defaultValue={selectedBlock?.name}
                  placeholder="e.g., Eastern Complex Wing"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 mt-2 text-sm text-slate-900 dark:text-white focus:border-purple-500 outline-none transition-all" 
                  required 
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Assigned Resident Structural Type</label>
                <div className="relative mt-2">
                  <select 
                    name="type" 
                    defaultValue={selectedBlock?.type || "BOYS"}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:border-purple-500 outline-none appearance-none cursor-pointer transition-all"
                  >
                    <option value="BOYS">BOYS Division Only</option>
                    <option value="GIRLS">GIRLS Division Only</option>
                    <option value="MIXED">MIXED Co-Educational Allocation</option>
                    <option value="STAFF">STAFF / Faculty Dedicated Only</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-900/10 transition-colors hover:bg-purple-500"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRoomModalOpen && viewingBlock && (
        <AddRoomModal 
          blockId={viewingBlock.id} 
          onClose={() => setIsRoomModalOpen(false)} 
          onSuccess={(newRoom) => setRooms([...rooms, newRoom])}
        />
      )}
    </div>
  );
}