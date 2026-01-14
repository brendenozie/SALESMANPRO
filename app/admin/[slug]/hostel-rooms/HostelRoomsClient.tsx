"use client";

import React, { useState } from "react";
import { 
  HomeModernIcon, 
  UserGroupIcon, 
  BoltIcon, 
  SquaresPlusIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const HostelRoomsClient = () => {
  const [activeWing, setActiveWing] = useState("North Wing");

  const rooms = [
    { id: '101', type: 'Double', floor: '1st', occupancy: 2, max: 2, status: 'Full', amenities: ['AC', 'Attached Bath'] },
    { id: '102', type: 'Single', floor: '1st', occupancy: 0, max: 1, status: 'Available', amenities: ['Non-AC'] },
    { id: '103', type: 'Double', floor: '1st', occupancy: 1, max: 2, status: 'Partial', amenities: ['AC', 'Balcony'] },
    { id: '201', type: 'Suite', floor: '2nd', occupancy: 4, max: 4, status: 'Full', amenities: ['AC', 'Kitchenette'] },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      {/* Structural Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-500 rounded-full" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Inventory & Infrastructure</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Room <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Inventory.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                {['North Wing', 'South Wing'].map(wing => (
                  <button 
                    key={wing}
                    onClick={() => setActiveWing(wing)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeWing === wing ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  > {wing} </button>
                ))}
             </div>
             <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-purple-50 transition-all">
                <SquaresPlusIcon className="h-4 w-4" />
                Add Room
             </button>
          </div>
        </header>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="group bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 hover:border-purple-500/30 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <HomeModernIcon className="h-6 w-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                  room.status === 'Available' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                  room.status === 'Partial' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                  'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {room.status}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-2xl font-black text-white italic">Room {room.id}</h3>
                <p className="text-xs text-slate-500 font-medium">{room.type} • Floor {room.floor}</p>
              </div>

              {/* Occupancy Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase mb-2">
                  <span>Occupancy</span>
                  <span>{room.occupancy}/{room.max}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${(room.occupancy / room.max) * 100}%` }} 
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-8">
                {room.amenities.map((amt, i) => (
                  <span key={i} className="text-[9px] font-bold bg-black/40 px-2 py-1 rounded border border-slate-800 text-slate-400 uppercase tracking-tighter">
                    {amt}
                  </span>
                ))}
              </div>

              <button className="w-full py-3 bg-slate-800 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all group-hover:shadow-lg group-hover:shadow-purple-900/20">
                Manage Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default HostelRoomsClient;