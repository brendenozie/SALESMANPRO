"use client";

import React, { useState, useMemo } from "react";
import { HomeModernIcon, SquaresPlusIcon } from "@heroicons/react/24/outline";
import AddRoomModal from "./AddRoomModal"; // We'll extract the modal for cleanliness
import CheckInForm from "./CheckInForm";

interface Props {
  initialRooms: any[];
  blocks: any[]; // New prop: array of HostelBlock objects
  schoolId: string;
}

const HostelRoomsClient = ({ initialRooms, blocks, schoolId }: Props) => {
  const [rooms, setRooms] = useState(initialRooms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  // 1. Identify which Block (Wing) is active
  const [activeBlockId, setActiveBlockId] = useState(blocks && blocks.length > 0 && blocks[0]?.id || "");

  // 2. Filter rooms based on the selected Block
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => room.blockId === activeBlockId);
  }, [rooms, activeBlockId]);

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
                    onClick={() => setActiveBlockId(block.id)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeBlockId === block.id ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  > {block.name} </button>
                ))}
             </div>
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
          {filteredRooms.map((room) => (
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
              
              <button 
                onClick={() => setSelectedRoomId(selectedRoomId === room.id ? null : room.id)}
                className="w-full py-3 bg-slate-800 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all"
              >
              {selectedRoomId === room.id ? "Close Panel" : "Manage Check-in"}
              </button>

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

      
    </main>
  );
};

export default HostelRoomsClient;