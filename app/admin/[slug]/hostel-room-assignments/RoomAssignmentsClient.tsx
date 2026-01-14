"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  UserPlusIcon, 
  ArrowsRightLeftIcon, 
  HomeIcon, 
  InboxArrowDownIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

const RoomAssignmentsClient = () => {
  const [unassigned] = useState([
    { id: 'STU-501', name: 'Liam Neeson', grade: '12-A', gender: 'M' },
    { id: 'STU-502', name: 'Sarah Jenkins', grade: '11-B', gender: 'F' },
    { id: 'STU-503', name: 'David Goggins', grade: '12-C', gender: 'M' },
  ]);

  const [rooms] = useState([
    { id: '101', type: 'Double', beds: [{ id: '101-A', student: 'Marcus H.' }, { id: '101-B', student: null }], wing: 'North' },
    { id: '102', type: 'Single', beds: [{ id: '102-A', student: null }], wing: 'North' },
    { id: '201', type: 'Double', beds: [{ id: '201-A', student: null }, { id: '201-B', student: null }], wing: 'South' },
  ]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto h-[85vh] flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Deployment Logic</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Room <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Assignments.</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">14 Beds Available</span>
             </div>
          </div>
        </header>

        <div className="flex-grow grid grid-cols-12 gap-8 overflow-hidden">
          {/* Left Side: Unassigned Residents */}
          <section className="col-span-12 lg:col-span-4 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
               <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <InboxArrowDownIcon className="h-5 w-5 text-indigo-400" />
                  Unassigned Residents
               </h3>
               <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">3</span>
            </div>
            
            <div className="p-4 border-b border-slate-800">
               <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="w-full bg-black/40 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-indigo-500" placeholder="Filter residents..." />
               </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {unassigned.map(student => (
                <div key={student.id} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-all group">
                   <div className="flex justify-between items-center">
                      <div>
                         <p className="text-xs font-black text-white">{student.name}</p>
                         <p className="text-[10px] text-slate-500 font-mono uppercase">{student.id} • {student.grade}</p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-black/40 flex items-center justify-center text-slate-500 group-hover:text-indigo-400">
                         <ArrowsRightLeftIcon className="h-4 w-4" />
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Side: Room Selection Grid */}
          <section className="col-span-12 lg:col-span-8 bg-slate-900/20 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden">
             <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
               <div className="flex gap-4">
                  <button className="text-xs font-black text-indigo-400 border-b-2 border-indigo-400 pb-1">All Wings</button>
                  <button className="text-xs font-black text-slate-500 hover:text-slate-300 transition-colors">North Wing</button>
                  <button className="text-xs font-black text-slate-500 hover:text-slate-300 transition-colors">South Wing</button>
               </div>
               <div className="flex gap-2">
                  <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"><HomeIcon className="h-4 w-4" /></button>
               </div>
            </div>

            <div className="flex-grow overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
               {rooms.map(room => (
                 <div key={room.id} className="bg-black/40 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/30 transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <h4 className="text-xl font-black text-white italic">Room {room.id}</h4>
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{room.type} • {room.wing} Wing</p>
                       </div>
                       <UserGroupIcon className="h-5 w-5 text-slate-700" />
                    </div>

                    <div className="space-y-3">
                       {room.beds.map((bed, idx) => (
                         <div 
                           key={idx} 
                           className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                             bed.student ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-slate-900/50 border-dashed border-slate-800 hover:bg-indigo-500/10 cursor-pointer'
                           }`}
                         >
                            <div className="flex items-center gap-3">
                               <div className={`h-2 w-2 rounded-full ${bed.student ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                               <span className="text-xs font-bold text-slate-400">Bed {bed.id.split('-')[1]}</span>
                            </div>
                            {bed.student ? (
                              <div className="flex items-center gap-2">
                                 <span className="text-xs font-black text-white">{bed.student}</span>
                                 <button className="text-[10px] text-rose-500 hover:underline">Remove</button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Empty Slot</span>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RoomAssignmentsClient;