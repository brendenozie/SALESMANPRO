"use client";

import React, { useState, useEffect } from "react";
import { 
  UserCircleIcon, 
  CheckCircleIcon, 
  MapPinIcon, 
  ChevronLeftIcon,
  PrinterIcon 
} from "@heroicons/react/24/solid";
import { CheckCircleIcon as OutlineCheck } from "@heroicons/react/24/outline";

const PassengerManifest = ({ shiftId }: { shiftId: string }) => {
  const [data, setData] = useState<any>(null);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManifest = async () => {
      const res = await fetch(`/api/admin/transport/shifts/${shiftId}/manifest`);
      const result = await res.json();
      if (result.success) setData(result.data);
      setLoading(false);
    };
    fetchManifest();
  }, [shiftId]);

  const toggleBoarding = (userId: string) => {
    setAttendance(prev => ({ ...prev, [userId]: !prev[userId] }));
    // In production, sync this to a 'TransportAttendance' model in DB
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500 uppercase text-xs font-black">Syncing Manifest...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-[#05070A] min-h-screen text-white p-6">
      {/* Manifest Header */}
      <div className="flex items-center justify-between mb-8">
        <button className="p-2 bg-slate-900 rounded-full"><ChevronLeftIcon className="h-5 w-5 text-slate-400"/></button>
        <div className="text-center">
          <h1 className="text-lg font-black italic">{data.shift.route.name}</h1>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
            {data.shift.vehicle.registration} • {data.passengers.length} Total
          </p>
        </div>
        <button className="p-2 bg-slate-900 rounded-full"><PrinterIcon className="h-5 w-5 text-slate-400"/></button>
      </div>

      {/* Manifest List */}
      <div className="space-y-3">
        {data.passengers.map((passenger: any) => (
          <div 
            key={passenger.id} 
            onClick={() => toggleBoarding(passenger.id)}
            className={`flex items-center justify-between p-4 rounded-[1.5rem] border transition-all cursor-pointer ${
              attendance[passenger.id] 
              ? 'bg-emerald-500/10 border-emerald-500/40' 
              : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                {passenger.image ? (
                  <img src={passenger.image} className="h-12 w-12 rounded-2xl object-cover" />
                ) : (
                  <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
                    <UserCircleIcon className="h-8 w-8" />
                  </div>
                )}
                {attendance[passenger.id] && (
                  <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-[#05070A]">
                    <CheckCircleIcon className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className={`text-sm font-bold ${attendance[passenger.id] ? 'text-emerald-400' : 'text-white'}`}>
                  {passenger.name}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{passenger.role}</p>
              </div>
            </div>

            <div className="text-right">
                <p className="text-[10px] text-slate-600 font-mono">ID: {passenger.id.slice(-5).toUpperCase()}</p>
                {attendance[passenger.id] ? (
                   <span className="text-[9px] font-black text-emerald-500 uppercase">Boarded</span>
                ) : (
                   <OutlineCheck className="h-5 w-5 text-slate-700 ml-auto" />
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="fixed bottom-8 left-6 right-6">
        <div className="bg-emerald-600 p-5 rounded-[2rem] shadow-2xl shadow-emerald-600/20 flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black uppercase text-emerald-200">Current Occupancy</p>
              <p className="text-2xl font-black">{Object.values(attendance).filter(Boolean).length} / {data.passengers.length}</p>
           </div>
           <button className="bg-white text-black px-6 py-3 rounded-2xl font-bold text-xs">
             Finalize Trip
           </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerManifest;