"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ClockIcon, ShieldCheckIcon, PhoneArrowUpRightIcon,
  CalendarDaysIcon, IdentificationIcon, ChatBubbleLeftEllipsisIcon
} from "@heroicons/react/24/outline";
import OnboardStaffModal from "./OnboardStaffModal";

interface Props {
  initialStaff: any[];
  schoolId: string;
}

const HostelStaffClient = ({ initialStaff, schoolId }: Props) => {
  const [staff, setStaff] = useState(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleDuty = async (dbId: string, currentIsOnDuty: boolean) => {
    const newStatus = !currentIsOnDuty;
    
    // Optimistic Update: Update UI immediately for a snappy feel
    const previousStaffState = [...staff];
    setStaff(staff.map(s => s.id === dbId ? { ...s, isOnDuty: newStatus } : s));

    try {
      const res = await fetch(`/api/admin/property/staff/${dbId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isOnDuty: newStatus }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error("Failed to sync with server");
      }

      const updatedMember = await res.json();
      toast.success(`${updatedMember.name} is now ${newStatus ? 'On-Duty' : 'Off-Duty'}`);
      
    } catch (err) {
      // Rollback UI state if the server call fails
      setStaff(previousStaffState);
      toast.error("Status update failed. Please try again.");
    }
  };

// 2. Adjust Statistics to use boolean logic
const stats = {
  wardens: staff?.filter(s => s.role === 'WARDEN' && s.isOnDuty).length,
  cleaners: staff?.filter(s => s.role === 'CLEANER' && s.isOnDuty).length,
  totalWardens: staff?.filter(s => s.role === 'WARDEN').length
};

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-violet-500 rounded-full" />
              <span className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em]">Personnel & Operations</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Duty <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Roster.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
              <CalendarDaysIcon className="h-4 w-4" /> Manage Schedule
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-violet-900/40">
              <IdentificationIcon className="h-4 w-4" /> Onboard Staff
            </button>
          </div>
        </header>

        {/* Dynamic Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Warden Presence</p>
                <h3 className="text-3xl font-black text-white mt-1">{stats.wardens} / {stats.totalWardens}</h3>
              </div>
              <ShieldCheckIcon className={`h-8 w-8 ${stats.wardens > 0 ? 'text-emerald-500' : 'text-rose-500'} opacity-50`} />
            </div>
            <p className={`text-[10px] font-bold mt-4 uppercase ${stats.wardens > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.wardens > 0 ? 'Minimum Safety Threshold Met' : 'Safety Warning: No Wardens On-Duty'}
            </p>
          </div>
          
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Cleaners</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.cleaners} Staff</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-4 uppercase tracking-tighter italic">Currently patrolling sanitation zones</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] border-b-4 border-b-violet-500/30">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Handover</p>
            <h3 className="text-3xl font-black text-white mt-1">Live Sync</h3>
            <p className="text-[10px] text-violet-400 font-bold mt-4 uppercase animate-pulse">Tracking {staff.length} personnel</p>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((member) => (
          <div key={member.id} className="...">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Generate Avatar from Name */}
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg">
                  {member.name.split(' ').map((n: any) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">{member.role}</span>
                    <span className="text-[10px] font-mono text-slate-600">#{member.staffId}</span>
                  </div>
                </div>
              </div>
              
              {/* Pulse indicator for isOnDuty */}
              <button 
                onClick={() => toggleDuty(member.id, member.isOnDuty)}
                className={`h-3 w-3 rounded-full transition-all cursor-pointer ${
                  member.isOnDuty ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'
                }`} 
              />
            </div>

            {/* Map correct fields */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-slate-800/50">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                <p className="text-xs text-slate-300 font-medium">{member.shiftLabel}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-slate-800/50">
                <PhoneArrowUpRightIcon className="h-4 w-4 text-slate-400" />
                <p className="text-xs font-mono text-slate-300">{member.phoneNumber}</p>
              </div>
            </div>
            
            {/* Email from the 'user' relation */}
            <div className="text-[10px] text-slate-500 truncate px-2 mb-4">
              Linked: {member.user?.email || "No account"}
            </div>
          </div>
        ))}
          {/* {staff.map((member) => (
            <div key={member.id} className="group bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-900/40 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">{member.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">{member.role}</span>
                       <span className="text-[10px] font-mono text-slate-600">#{member.id}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleDuty(member.dbId, member.status)}
                  className={`h-3 w-3 rounded-full transition-all cursor-pointer ${
                    member.status === 'On-Duty' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'
                  }`} 
                />
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-slate-800/50">
                  <ClockIcon className="h-4 w-4 text-slate-500" />
                  <p className="text-xs text-slate-300 font-medium">{member.shift}</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-slate-800/50">
                  <PhoneArrowUpRightIcon className="h-4 w-4 text-slate-500" />
                  <p className="text-xs font-mono text-slate-300 tracking-wider">{member.contact}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-grow py-3 bg-slate-800 hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2">
                  <ChatBubbleLeftEllipsisIcon className="h-4 w-4" /> Message
                </button>
                <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
                  <IdentificationIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))} */}
        </div>
      </div>

      {/* // Render the modal at the bottom of the component */}
      {isModalOpen && (
        <OnboardStaffModal 
          schoolId={schoolId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newMember: any) => {
            // Refresh the staff list locally
            setStaff((prev: any) => [...prev, {
              ...newMember,
              avatar: newMember.name.split(' ').map((n:any) => n[0]).join('').toUpperCase(),
              status: 'Resting',
              shift: newMember.shiftLabel // Or map from returned data
            }]);
          }}
        />
      )}
    </main>
  );
};

export default HostelStaffClient;