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

interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  floor: number;
  allocations: any[];
}

export function FloorPlanView({ rooms, onEditRoom }: { rooms: Room[], onEditRoom: (r: Room) => void }) {

  if (rooms.length === 0) {
    return (
      <div className="text-center text-slate-500 italic">
        No rooms available in this block.
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
    <div className="space-y-12">
      {Object.keys(floors).sort().reverse().map((floor) => (
        <div key={floor} className="relative">
          <div className="absolute -left-6 top-0 bottom-0 w-1 bg-purple-900/30 rounded-full" />
          <h4 className="text-xl font-black text-slate-500 mb-6 uppercase tracking-tighter">
            Floor {floor === "0" ? "Ground" : floor}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {floors[Number(floor)].map((room) => {
              const isFull = room.allocations?.length >= room.capacity;
              return (
                <button
                  key={room.id}
                  onClick={() => onEditRoom(room)}
                  className={`p-4 rounded-2xl border transition-all text-left group
                    ${isFull ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}
                    hover:border-purple-500/50`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg font-bold text-white">{room.roomNumber}</span>
                    <div className={`h-2 w-2 rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    Occupancy: {room.allocations?.length || 0} / {room.capacity}
                  </div>
                  <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all" 
                      style={{ width: `${((room.allocations?.length || 0) / room.capacity) * 100}%` }}
                    />
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