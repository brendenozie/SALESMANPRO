"use client";

import React, { useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon,
  BellAlertIcon,
  XMarkIcon,
  ArrowRightCircleIcon,
  SparklesIcon,
  InboxStackIcon
} from "@heroicons/react/24/outline";
import NewReservationModal from "./NewReservationModal";

interface Reservation {
  id: string;
  book: string;
  member: string;
  memberEmail: string;
  requestDate: string;
  status: 'Pending' | 'Ready';
  position: number;
  expectedArrival: string;
}

interface ClientProps {
  initialReservations: Reservation[];
  schoolId: string;
}

const LibraryReservationsClient = ({ initialReservations = [], schoolId = '' }: ClientProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'ready'>('pending');
  const [items, setItems] = useState<Reservation[]>(initialReservations);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewReservation = async (data: any) => {
    try {
      const res = await fetch(`/api/admin/library/reservations?companyId=${schoolId}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        toast.success("Member added to the queue");
        // You should trigger a refresh or update state here
        window.location.reload(); 
      } else {
        toast.error("Invalid Book or Member ID");
      }
    } catch (err) {
      toast.error("Failed to process reservation");
    }
  };

  const filteredData = useMemo(() => {
    return items.filter(res => 
      activeTab === 'ready' ? res.status === 'Ready' : res.status === 'Pending'
    );
  }, [items, activeTab]);

  const handleCancelHold = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;

    setIsActionLoading(id);
    try {
      const res = await fetch(`/api/admin/library/reservations/${id}?companyId=${schoolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
        toast.success("Hold released and book status updated");
      } else {
        toast.error("Failed to update reservation status");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleNotify = async (res: Reservation) => {
    toast.promise(
      fetch(`/api/admin/library/reservations/notify?companyId=${schoolId}`, {
        method: 'POST',
        body: JSON.stringify({ reservationId: res.id, email: res.memberEmail }),
        headers: { 'Content-Type': 'application/json' }
      }),
      {
        loading: 'Sending pick-up alert...',
        success: `Notification sent to ${res.member}!`,
        error: 'Notification service unavailable',
      }
    );
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-violet-500 rounded-full" />
              <span className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em]">Hold Requests</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Queue <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Management.</span>
            </h1>
          </div>

          <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Waitlist ({items.filter(i => i.status === 'Pending').length})
            </button>
            <button 
              onClick={() => setActiveTab('ready')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'ready' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Ready for Pickup ({items.filter(i => i.status === 'Ready').length})
            </button>
          </div>
        </header>

        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-slate-900/10 border-2 border-dashed border-slate-800/50 rounded-[2.5rem]">
            <InboxStackIcon className="h-12 w-12 text-slate-800 mb-4" />
            <h3 className="text-slate-500 font-medium">No active {activeTab} reservations</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredData.map((res) => (
              <div key={res.id} className="relative group bg-slate-900/30 border border-slate-800/60 rounded-[2rem] p-6 hover:border-violet-500/40 transition-all overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black border ${
                    res.status === 'Ready' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                  }`}>
                    {res.status === 'Ready' ? 'AVAILABLE AT DESK' : `QUEUE POSITION: #${res.position}`}
                  </div>
                  <button 
                    disabled={isActionLoading === res.id}
                    onClick={() => handleCancelHold(res.id)}
                    className="p-2 hover:bg-rose-500/10 hover:text-rose-400 text-slate-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">{res.book}</h3>
                  <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                    <UserGroupIcon className="h-4 w-4 text-violet-500/50" />
                    <span>{res.member}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 rounded-2xl border border-slate-800/50 mb-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-1">Hold Date</p>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                      {res.requestDate}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-1">Estimate</p>
                    <div className={`flex items-center gap-2 text-xs font-bold ${res.status === 'Ready' ? 'text-emerald-400' : 'text-violet-400'}`}>
                      <ClockIcon className="h-3.5 w-3.5" />
                      {res.status === 'Ready' ? 'Ready' : res.expectedArrival}
                    </div>
                  </div>
                </div>

                {res.status === 'Ready' ? (
                  <button 
                    onClick={() => handleNotify(res)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                  >
                    <BellAlertIcon className="h-4 w-4" />
                    Send Pickup Notification
                  </button>
                ) : (
                  <button className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                    <ArrowRightCircleIcon className="h-4 w-4" />
                    View Queue Details
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => setIsModalOpen(true)}
             className="group border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center p-8 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all min-h-[300px]">
              <div className="p-4 bg-slate-900 rounded-2xl group-hover:scale-110 transition-all group-hover:bg-violet-600/10">
                <SparklesIcon className="h-6 w-6 text-violet-500" />
              </div>
              <span className="mt-4 font-bold text-slate-400 group-hover:text-violet-300">New Reservation Hold</span>
              <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-widest">Manual Override</p>
            </button>
          </div>
        )}
          </div>
          
          <NewReservationModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleNewReservation}
            schoolId={schoolId}
          />
    </main>
  );
};

export default LibraryReservationsClient;