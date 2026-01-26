"use client";

import React, { useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  WrenchIcon, LightBulbIcon, BeakerIcon, ClockIcon, 
  CheckCircleIcon, ExclamationTriangleIcon, PlusIcon, 
  ChatBubbleLeftRightIcon 
} from "@heroicons/react/24/outline";
import FileRequestModal from "./FileRequestModal";

interface Props {
  initialTickets: any[];
  schoolId: string;
}

const MaintenancePageClient = ({ initialTickets, schoolId }: Props) => {
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState('all tickets');
  // Inside MaintenancePageClient.tsx
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtering Logic
  const filteredTickets = useMemo(() => {
    if (filter === 'all tickets') return tickets;
    if (filter === 'active') return tickets.filter(t => t.status !== 'COMPLETED');
    if (filter === 'high priority') return tickets.filter(t => t.priority === 'HIGH');
    if (filter === 'completed') return tickets.filter(t => t.status === 'COMPLETED');
    return tickets;
  }, [tickets, filter]);

  const updateStatus = async (ticketId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/hostel/maintenance/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      setTickets(tickets.map(t => t.dbId === ticketId ? { ...t, status: newStatus } : t));
      toast.success(`Ticket marked as ${newStatus}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-orange-500 rounded-full" />
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">Facility Upkeep</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Tickets.</span>
            </h1>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-[2rem] font-bold text-sm transition-all shadow-lg shadow-orange-900/40">
            <PlusIcon className="h-5 w-5 stroke-[3px]" />
            File New Request
          </button>
          
        </header>

        {/* Filter Bar */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['All Tickets', 'Active', 'High Priority', 'Completed'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setFilter(tab.toLowerCase())}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                filter === tab.toLowerCase() ? 'bg-white text-black border-white' : 'bg-slate-900/50 text-slate-500 border-slate-800'
              }`}
            > {tab} </button>
          ))}
        </div>

        {/* Ticket List */}
        <div className="space-y-4">
          {filteredTickets.map((tkt) => (
            <div key={tkt.id} className="group bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-6 border-l-4" 
                 style={{ borderLeftColor: tkt.priority === 'HIGH' ? '#ef4444' : tkt.priority === 'MEDIUM' ? '#f59e0b' : '#3b82f6' }}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                
                <div className="flex items-center gap-6 w-full lg:w-1/3">
                  <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center text-orange-400">
                    {tkt.category === 'PLUMBING' ? <BeakerIcon className="h-7 w-7" /> : <WrenchIcon className="h-7 w-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-500">{tkt.id}</span>
                      <span className="text-[10px] font-black text-orange-500 uppercase">Room {tkt.room}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white">{tkt.issue}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase ${
                      tkt.status === 'IN_PROGRESS' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      tkt.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                   }`}>
                     {tkt.status.replace('_', ' ')}
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   {tkt.status !== 'COMPLETED' && (
                     <button 
                       onClick={() => updateStatus(tkt.dbId, 'COMPLETED')}
                       className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/30 rounded-xl text-xs font-bold transition-all"
                     >
                       Mark Resolved
                     </button>
                   )}
                   <button className="p-3 bg-slate-800 text-slate-400 rounded-xl">
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At the bottom of return */}
      {isModalOpen && (
        <FileRequestModal 
          rooms={[]} // You'll need to pass room data from your page.tsx fetch allRooms
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newTkt: any) => setTickets([newTkt, ...tickets])}
        />
      )}
    </main>
  );
};

export default MaintenancePageClient;