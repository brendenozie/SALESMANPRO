"use client";

import React, { useState, useMemo } from "react";
import { 
  InformationCircleIcon, 
  ArrowRightIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import UnifiedHostelModal from "../rooms/UnifiedHostelModal"; // Reusing our previous modal

const FloorPlanClient = ({ initialRooms, blocks, schoolId }: any) => {
  const [activeBlockId, setActiveBlockId] = useState(blocks[0]?.id || "");
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  
  // Modal state for Add/Edit/Allocate
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });

  // 1. Filter rooms based on spatial selection
  const currentFloorRooms = useMemo(() => {
    return initialRooms.filter((r: any) => 
      r.blockId === activeBlockId && r.floor === selectedFloor
    );
  }, [initialRooms, activeBlockId, selectedFloor]);

  // 2. Derive the hovered room object for the Intelligence Panel
  const hoveredRoom = useMemo(() => 
    initialRooms.find((r: any) => r.id === hoveredRoomId), 
    [hoveredRoomId, initialRooms]
  );

  // 3. Get list of available floors for the current block
  const floors = useMemo(() => {
    const blockRooms = initialRooms.filter((r: any) => r.blockId === activeBlockId);
    const uniqueFloors = Array.from(new Set(blockRooms.map((r: any) => r.floor)));
    return (uniqueFloors.length > 0 ? uniqueFloors : [1]).sort();
  }, [initialRooms, activeBlockId]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Navigation */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-500 rounded-full" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Floor Management</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Spatial <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Command.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Block Selector */}
            <select 
              value={activeBlockId}
              onChange={(e) => setActiveBlockId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white focus:ring-2 ring-purple-500 outline-none"
            >
              {blocks.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            {/* Floor Navigator */}
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-xl">
              {floors.map((f: any) => (
                <button 
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${selectedFloor === f ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-500 hover:text-white'}`}
                > F{f} </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Blueprint View */}
          <div className="lg:col-span-3 bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8 lg:p-12 relative overflow-hidden min-h-[600px]">
            {/* Blueprint Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
              {currentFloorRooms.map((room: any) => (
                <div 
                  key={room.id}
                  onMouseEnter={() => setHoveredRoomId(room.id)}
                  onClick={() => setModalConfig({ isOpen: true, type: "ROOM", mode: "EDIT", data: room })}
                  className={`h-40 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group relative
                    ${room.occupancy >= room.capacity ? 'bg-slate-950/80 border-slate-800' : 
                      room.occupancy === 0 ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/40' :
                      'bg-purple-500/5 border-purple-500/10 hover:border-purple-500/40'}`}
                >
                  <span className="text-xs font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">
                    Room {room.roomNumber}
                  </span>
                  
                  {/* Occupancy Pips */}
                  <div className="flex gap-1.5">
                    {[...Array(room.capacity)].map((_, i) => (
                      <div key={i} className={`h-2 w-2 rounded-full transition-all ${i < room.occupancy ? 'bg-purple-500' : 'bg-slate-800'}`} />
                    ))}
                  </div>

                  {/* Status Badges */}
                  <div className="absolute bottom-4 flex gap-2">
                    {room.maintenanceRequests?.length > 0 && (
                       <ExclamationTriangleIcon className="h-4 w-4 text-rose-500 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}

              {/* Add Room Placeholder */}
              <button 
                onClick={() => setModalConfig({ isOpen: true, type: "ROOM", mode: "ADD" })}
                className="h-40 rounded-[2rem] border-2 border-dashed border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-purple-400"
              >
                <AdjustmentsHorizontalIcon className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase">Add Unit</span>
              </button>
            </div>

            {/* Legend */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 border-t border-slate-800/50 pt-8">
              {[
                { label: 'Available', color: 'bg-emerald-500' },
                { label: 'Partial', color: 'bg-purple-500' },
                { label: 'Full', color: 'bg-slate-700' },
                { label: 'Issue', color: 'bg-rose-500 animate-pulse' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} /> {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 sticky top-8">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-purple-400" />
                Unit Telemetry
              </h3>

              {hoveredRoom ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <p className="text-[10px] font-black text-purple-500 uppercase">Current Selection</p>
                  <h4 className="text-3xl font-black text-white mt-1">Room {hoveredRoom.roomNumber}</h4>
                  
                  <div className="mt-6 space-y-4">
                    <div className="bg-black/40 p-4 rounded-2xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
                      <p className={`text-xs font-bold ${hoveredRoom.occupancy >= hoveredRoom.capacity ? 'text-slate-400' : 'text-emerald-400'}`}>
                        {hoveredRoom.occupancy >= hoveredRoom.capacity ? 'Maximum Capacity' : 'Space Available'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-black/20 p-3 rounded-xl border border-slate-800">
                        <span className="block text-slate-500 mb-1">Residents</span>
                        <span className="text-white font-bold">{hoveredRoom.occupancy} / {hoveredRoom.capacity}</span>
                      </div>
                      <div className="bg-black/20 p-3 rounded-xl border border-slate-800">
                        <span className="block text-slate-500 mb-1">Type</span>
                        <span className="text-white font-bold">{hoveredRoom.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button 
                      onClick={() => setModalConfig({ isOpen: true, type: "ALLOCATION", mode: "ADD", data: hoveredRoom })}
                      className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlusIcon className="h-4 w-4" /> Check-in Student
                    </button>
                    <button 
                      onClick={() => setModalConfig({ isOpen: true, type: "MAINTENANCE", mode: "ADD", data: hoveredRoom })}
                      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <WrenchScrewdriverIcon className="h-4 w-4" /> Report Issue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="h-12 w-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AdjustmentsHorizontalIcon className="h-6 w-6 text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-600 italic px-4">Hover over a unit to engage the intelligence system.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Controller */}
      {modalConfig.isOpen && (
        <UnifiedHostelModal 
          config={modalConfig} 
          schoolId={schoolId}
          blockId={activeBlockId}
          onClose={() => setModalConfig({ isOpen: false })}
          onSuccess={() => {
            setModalConfig({ isOpen: false });
            window.location.reload(); // Refresh to get updated occupancy
          }}
        />
      )}
    </main>
  );
};

export default FloorPlanClient;