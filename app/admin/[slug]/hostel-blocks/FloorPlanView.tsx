"use client";

import React from "react";
import { 
  UserGroupIcon, 
  HashtagIcon,
  ChevronDoubleUpIcon
} from "@heroicons/react/24/outline";

interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  occupancy: number;
  floor: number;
  residents: any[];
}

export function FloorPlanView({ rooms, onEditRoom }: { rooms: Room[], onEditRoom: (r: Room) => void }) {

  // console.log("Rendering FloorPlanView with rooms:", rooms);

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 rounded-[3rem] border-2 border-dashed border-slate-800">
        <HashtagIcon className="h-10 w-10 text-slate-700 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          No rooms architectural data available.
        </p>
      </div>
    );
  }

  // Group rooms by floor
  const floors = rooms.reduce((acc, room) => {
    const f = room.floor || 0;
    if (!acc[f]) acc[f] = [];
    acc[f].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  return (
    <div className="space-y-16">
      {Object.keys(floors).sort((a, b) => Number(b) - Number(a)).map((floor) => (
        <div key={floor} className="group/floor">
          {/* Floor Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-600/20 text-purple-500">
              <ChevronDoubleUpIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-white tracking-tighter">
                {floor === "0" ? "Ground" : `Level 0${floor}`}
              </h4>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {floors[Number(floor)].length} Units Total
              </p>
            </div>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-800 to-transparent" />
          </div>
          
          {/* Room Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {floors[Number(floor)].map((room) => {
              const occupancyCount = room.occupancy || 0;
              const isFull = occupancyCount >= room.capacity;
              const percentage = (occupancyCount / room.capacity) * 100;

              return (
                <button
                  key={room.id}
                  onClick={() => onEditRoom(room)}
                  className={`relative p-6 rounded-[2rem] border transition-all duration-300 text-left group/room overflow-hidden
                    ${isFull 
                      ? 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/40' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-purple-500/40'}
                    hover:shadow-2xl hover:shadow-purple-500/5 active:scale-95`}
                >
                  {/* Visual Status Indicator */}
                  <div className={`absolute top-0 right-0 h-16 w-16 -mr-8 -mt-8 rounded-full blur-2xl transition-opacity
                    ${isFull ? 'bg-rose-500/20 opacity-100' : 'bg-purple-500/10 opacity-0 group-hover/room:opacity-100'}`} 
                  />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-2xl font-black text-white italic tracking-tighter group-hover/room:text-purple-400 transition-colors">
                        {room.roomNumber}
                      </span>
                      <div className={`h-2.5 w-2.5 rounded-full border-2 border-[#05070A] shadow-[0_0_10px_rgba(0,0,0,0.5)]
                        ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <UserGroupIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        {occupancyCount} / {room.capacity} Beds
                      </span>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-slate-800/50">
                      <div 
                        className={`h-full transition-all duration-700 ease-out rounded-full
                          ${isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-600 to-indigo-500'}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    {isFull && (
                      <p className="mt-3 text-[9px] font-black text-rose-500 uppercase tracking-tighter text-center">
                        At Capacity
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}