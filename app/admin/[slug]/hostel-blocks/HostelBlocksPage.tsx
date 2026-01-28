"use client";

import React, { useEffect, useState } from "react";
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
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
  const [viewingBlock, setViewingBlock] = useState<any>(null); // State to track drill-down
  const [rooms, setRooms] = useState<any[]>([]); // Rooms for the selected block
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) return setSearchResults([]);
    
    setIsSearching(true);
    const res = await fetch(`/api/admin/hostel/allocate?q=${val}&companyId=${schoolId}`);
    const json = await res.json();
    setSearchResults(json.data || []);
    setIsSearching(false);
  };

  const assignResident = async (userId: string) => {
    const res = await fetch(`/api/admin/hostel/allocate`, {
      method: "POST",
      body: JSON.stringify({ roomId: selectedRoom.id, userId }),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      toast.success("Resident allocated successfully");
      setIsAssigning(false);
      // Refresh room details to show new resident
      openBlock(viewingBlock); 
      setSelectedRoom(null); // Close and refresh
    }
  };

  const openBlock = async (block: any) => {
    setViewingBlock(block);
    const res = await fetch(`/api/admin/hostel/rooms?blockId=${block.id}`);
    const json = await res.json();
    setRooms(json.data || []);
  };

  const openRoom = async (room: any) => {
    const res = await fetch(`/api/admin/hostel/rooms/${room.id || room._id}`);
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

  return (
    <>
      
      {viewingBlock ? (
        <main className="min-h-screen bg-[#05070A] p-8">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => setViewingBlock(null)}
              className="text-slate-500 hover:text-white mb-8 flex items-center gap-2 font-bold transition-colors"
            >
              ← Back to All Blocks
            </button>
            
            <header className="flex justify-between items-end mb-12">
              <div>
                <h1 className="text-4xl font-black text-white">{viewingBlock.name}</h1>
                <p className="text-purple-500 font-bold uppercase tracking-widest text-xs">{viewingBlock.type} BLOCK</p>
              </div>
              <button className="bg-white text-black px-6 py-3 rounded-2xl font-black text-sm hover:bg-purple-400 transition-colors"
                onClick={() => { 
                    setSelectedRoom(null); 
                    setIsRoomModalOpen(true); 
                  }}
              >
                + Add New Room
              </button>
            </header>

            <FloorPlanView rooms={rooms} 
              onEditRoom={(room) => openRoom(room)} />
          </div>
          {/* Slide-over Backdrop */}
          <div className={`fixed inset-0 z-[70] transition-opacity duration-300 ${selectedRoom ? "opacity-100 visible" : "opacity-0 invisible"}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRoom(null)} />
            {/* The Panel */}
            <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#0A0C10] border-l border-slate-800 shadow-2xl transform transition-transform duration-500 ease-out ${selectedRoom ? "translate-x-0" : "translate-x-full"}`}>
              {selectedRoom && (
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-8 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center font-black text-xl text-white">
                        {selectedRoom.roomNumber}
                      </div>
                      <button onClick={() => setSelectedRoom(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                        <PlusIcon className="h-6 w-6 rotate-45" />
                      </button>
                    </div>
                    <h2 className="text-2xl font-black text-white">Room Details</h2>
                    <p className="text-slate-500 text-sm">Floor {selectedRoom.floor} • {selectedRoom.capacity} Bed Capacity</p>
                  </div>


                  {isAssigning ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase">Find Resident</h3>
                        <button onClick={() => setIsAssigning(false)} className="text-xs text-purple-500 font-bold">Cancel</button>
                      </div>

                      <div className="relative">
                        <input 
                          autoFocus
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          placeholder="Search by name or ID..."
                          className="w-full bg-black border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        {isSearching && <div className="absolute right-4 top-4 animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />}
                      </div>

                      <div className="space-y-2">
                        {searchResults.map((user: any) => (
                          <button
                            key={user.id}
                            onClick={() => assignResident(user.id)}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group"
                          >
                            <div className="text-left">
                              <p className="text-sm font-bold text-white group-hover:text-emerald-400">{user.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">{user.studentId || "No ID"}</p>
                            </div>
                            <PlusIcon className="h-5 w-5 text-slate-600 group-hover:text-emerald-500" />
                          </button>
                        ))}
                        
                        {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                          <p className="text-center py-8 text-slate-500 text-sm italic">No unallocated residents found.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    // {/* Resident List */}
                    <div className="flex-1 overflow-y-auto p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Current Residents</h3>
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-[10px] font-bold">
                          {selectedRoom.allocations?.length} / {selectedRoom.capacity} Occupied
                        </span>
                      </div>

                      <div className="space-y-4">
                        {selectedRoom.allocations?.length > 0 ? (
                          selectedRoom.allocations?.map((allocation: any) => (
                            <div key={allocation.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-all">
                              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <UsersIcon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-white">{allocation.residentName || "Assigned Resident"}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Joined: {new Date(allocation.createdAt).toLocaleDateString()}</p>
                              </div>
                              <button className="text-[10px] font-black text-rose-500 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-colors">
                                EVict
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">
                            <p className="text-slate-600 font-medium italic">This room is currently empty.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="p-8 border-t border-slate-800 bg-black/40 grid grid-cols-2 gap-4">
                    <button className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all">
                      Maintenance
                    </button>
                    <button onClick={()=>{
                      setIsAssigning(true);
                    }} className="py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-900/20">
                      Assign Resident
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
      <main className="min-h-screen bg-[#05070A] p-8">
        <div className="max-w-7xl mx-auto">          
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl font-black text-white">Infrastructure <span className="text-purple-500">Blocks.</span></h1>
              <p className="text-slate-500 text-sm">Manage buildings and wing assignments</p>
            </div>
            <button 
              onClick={() => { setSelectedBlock(null); setIsModalOpen(true); }}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
            >
              <PlusIcon className="h-5 w-5" /> Add Block
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map((block: any) => (
              <div key={block.id} className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
                {/* Type Badge */}
                <div className="absolute top-0 right-0 px-6 py-2 bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-bl-2xl">
                  {block.type}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                    <BuildingOfficeIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{block.name}</h3>
                    <p className="text-xs text-slate-500">{block.roomCount} Total Rooms</p>
                  </div>
                </div>

                {/* Aggregated Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/30 p-4 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Capacity</p>
                    <p className="text-xl font-black text-white">{block.totalCapacity}</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Current Residents</p>
                    <p className="text-xl font-black text-purple-400">{block.totalOccupancy}</p>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelectedBlock(block); setIsModalOpen(true); }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <PencilSquareIcon className="h-4 w-4 text-slate-400" /> Edit
                  </button>
                  <button
                    onClick={() => openBlock(block)}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    View Rooms
                  </button>
                  <button 
                    onClick={() => handleDelete(block.id)}
                    className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>      
      </main>
      )}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-6">
                {selectedBlock ? "Edit" : "New"} <span className="text-purple-500">Block.</span>
              </h2>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  name: formData.get("name"),
                  type: formData.get("type"),
                  companyId: schoolId
                };

                const method = selectedBlock ? "PUT" : "POST"; // Implement PUT in API if needed
                const res = await fetch(`/api/admin/hostel/blocks${selectedBlock ? `?id=${selectedBlock.id}` : ''}`, {
                  method,
                  body: JSON.stringify(data),
                  headers: { "Content-Type": "application/json" }
                });

                if (res.ok) {
                  toast.success("Block saved successfully");
                  setIsModalOpen(false);
                  fetchBlocks();
                }
              }} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Block Name</label>
                  <input 
                    name="name" 
                    defaultValue={selectedBlock?.name}
                    placeholder="e.g., Kilimanjaro Wing"
                    className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Block Type</label>
                  <select 
                    name="type" 
                    defaultValue={selectedBlock?.type || "BOYS"}
                    className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                  >
                    <option value="BOYS">BOYS Only</option>
                    <option value="GIRLS">GIRLS Only</option>
                    <option value="MIXED">Mixed / Co-ed</option>
                    <option value="STAFF">Staff Only</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-slate-800 text-white rounded-2xl font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-900/30"
                  >
                    Save Block
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isRoomModalOpen && (
            <AddRoomModal 
              blockId={viewingBlock.id} 
              onClose={() => setIsRoomModalOpen(false)} 
              onSuccess={(newRoom) => setRooms([...rooms, newRoom])}
            />
          )}

          
    </>
  );
}