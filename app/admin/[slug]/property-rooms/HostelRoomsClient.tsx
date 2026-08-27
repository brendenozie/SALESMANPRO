"use client";

import React, { useState, useMemo, useEffect } from "react";
import { HomeModernIcon, SquaresPlusIcon } from "@heroicons/react/24/outline";
import AddRoomModal from "./AddRoomModal"; // We'll extract the modal for cleanliness
import CheckInForm from "./CheckInForm";
import { toast } from "react-hot-toast";

interface Props {
  initiablocks: any[]; // New prop: array of HostelBlock objects
  initialProperties: any[]; // New prop: array of Property objects for dropdowns
  companyId: string;
}

const HostelRoomsClient = ({ initiablocks, initialProperties, companyId }: Props) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState(initiablocks);
  const [properties, setProperties] = useState(initialProperties);
  
  // 1. Identify which Block (Wing) is active
  const [activeBlockId, setActiveBlockId] = useState(blocks && blocks.length > 0 && blocks[0]?.id || "");
  const [selectedBlock, setSelectedBlock] = useState(blocks && blocks.length > 0 ? blocks[0] : null);

  // 2. Filter rooms based on the selected Block
  // const filteredRooms = useMemo(() => {
  //   return rooms.filter(room => room.blockId === activeBlockId);
  // }, [rooms, activeBlockId]);

  const fetchBlocks = async () => {
    const res = await fetch(`/api/admin/property/blocks?companyId=${companyId}`);
    const json = await res.json();
    setBlocks(json.data || []);
  };

  const fetchRooms = async (blockId: string) => {
    const res = await fetch(`/api/admin/property/rooms?blockId=${blockId}&companyId=${companyId}`);
    const json = await res.json();
    setRooms(json.data || []);
  };

  useEffect(() => {
    fetchRooms(activeBlockId);
  }, [activeBlockId]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-500 rounded-full" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Inventory</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Room <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Inventory.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                {blocks && blocks.length > 0 && blocks.map(block => (
                  <button 
                    key={block.id}
                    onClick={() => {
                      setActiveBlockId(block.id);
                      setSelectedBlock(block);
                    }}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeBlockId === block.id ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  > {block.name} </button>
                ))}
             </div>
             <button
                onClick={() => {
                  setIsBlockModalOpen(true);
                  setSelectedBlock(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-purple-50 transition-all"
              >
                <SquaresPlusIcon className="h-4 w-4" />
                Add Block
             </button>
             
             <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-purple-50 transition-all"
              >
                <SquaresPlusIcon className="h-4 w-4" />
                Add Room
             </button>
          </div>
        </header>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="group bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 hover:border-purple-500/30 transition-all relative">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <HomeModernIcon className="h-6 w-6" />
                </div>
                {/* Status logic based on Allocation Count vs Capacity */}
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                  room.occupancy === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                  room.occupancy < room.capacity ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                  'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {room.occupancy === 0 ? 'Available' : room.occupancy < room.capacity ? 'Partial' : 'Full'}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-2xl font-black text-white italic">Room {room.roomNumber}</h3>
                <p className="text-xs text-slate-500 font-medium">{room.type} • Floor {room.floor || 'G'}</p>
              </div>

              {/* Occupancy Bar using room.capacity from DB */}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase mb-2">
                  <span>Occupancy</span>
                  <span>{room.occupancy || 0}/{room.capacity}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-700" 
                    style={{ width: `${((room.occupancy || 0) / room.capacity) * 100}%` }} 
                  />
                </div>
              </div>

              {/* <button className="w-full py-3 bg-slate-800 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all">
                Manage Details
              </button> */}
              
              {/* <button 
                onClick={() => setSelectedRoomId(selectedRoomId === room.id ? null : room.id)}
                className="w-full py-3 bg-slate-800 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all"
              >
              {selectedRoomId === room.id ? "Close Panel" : "Manage Check-in"}
              </button> */}

              {selectedRoomId === room.id && (
                  <CheckInForm 
                    roomId={room.id} 
                    roomNumber={room.roomNumber} 
                    onAllocationComplete={() => {
                        // Refresh data or update local state
                        setSelectedRoomId(null);
                        window.location.reload(); // Simple refresh for now
                    }}
                  />
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Integration */}
      {isModalOpen && (
        <AddRoomModal 
          blockId={activeBlockId} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={(newRoom) => setRooms([...rooms, newRoom])}
        />
      )}

      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-6">
                {selectedBlock ? "Edit" : "New"} <span className="text-purple-500">Block.</span>
              </h2>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  propertyId: formData.get("propertyId"),
                  name: formData.get("name"),
                  type: formData.get("type"),
                  companyId: companyId
                };

                const method = selectedBlock ? "PUT" : "POST"; // Implement PUT in API if needed
                const res = await fetch(`/api/admin/property/blocks${selectedBlock ? `?id=${selectedBlock.id}` : ''}`, {
                  method,
                  body: JSON.stringify(data),
                  headers: { "Content-Type": "application/json" }
                });

                if (res.ok) {
                  toast.success("Block saved successfully");
                  setIsBlockModalOpen(false);
                  fetchBlocks();
                }
              }} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Select Property</label>
                  <select
                    name="propertyId"
                    defaultValue={selectedBlock?.propertyId || properties[0]?.id || ""}
                    className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Select Property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                    defaultValue={selectedBlock?.type || "STUDIO"}
                    className="w-full bg-black/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                  >
                    <option value="STUDIO">Studio / Micro-Apartments</option>
                    <option value="STANDARD_RESIDENTIAL">Standard Residential (Mid-Market)</option>
                    <option value="PREMIUM_SERVICED">Premium / Serviced Apartments</option>
                    <option value="COLIVING_SHARED_APARTMENT">Co-Living / Shared Blocks</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    type="button" 
                    onClick={() => setIsBlockModalOpen(false)}
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
      
    </main>
  );
};

export default HostelRoomsClient;