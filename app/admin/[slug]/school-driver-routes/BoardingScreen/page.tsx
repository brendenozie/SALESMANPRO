'use client';

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  FaceSmileIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
// import { getAuthSession } from '@/lib/auth';
// import { findCompanyCached } from '@/lib/company-fetcher';

// --- Types ---
type Student = {
  id: string;
  name: string;
  grade: string;
  photo: string;
  status: 'pending' | 'on-board' | 'absent';
  notes?: string;
};

interface BoardingScreenProps {
  stopName: string;
  students: Student[];
  onComplete: () => void;
}

export default async function BoardingScreen({ stopName, students: initialStudents, onComplete }: any) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'boarded'>('all');
  
    // const { slug } = await params;
  
    // const session = await getAuthSession();
  
    // // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    // const identifier = slug || session?.user?.id || '';
  
    // // 2. Retrieve the memoized company data (no extra DB cost)
    // const company = await findCompanyCached(identifier, "page");
  
    // if (!company) {
    //   return <div>Company not found</div>;
    // }
  
    // // Use the actual database ID for your API calls, ensuring consistency
    // const companyId = company.id;

  const toggleStatus = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextStatus = s.status === 'on-board' ? 'pending' : 'on-board';
      return { ...s, status: nextStatus };
    }));
  };

  const markAbsent = (id: string) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'absent' } : s
    ));
  };

  const stats = {
    total: students.length,
    boarded: students.filter(s => s.status === 'on-board').length,
    missing: students.filter(s => s.status === 'pending').length,
  };

  return (
    <div className="fixed inset-0 bg-[#0A0C10] z-[110] flex flex-col font-sans">
      
      {/* --- TOP HUD --- */}
      <div className="bg-[#12161F] p-6 pb-8 rounded-b-[3rem] border-b border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <button className="p-3 bg-white/5 rounded-2xl text-slate-400">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <div className="text-center">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Active Stop</h2>
            <p className="text-xl font-black italic text-white uppercase">{stopName}</p>
          </div>
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Total" value={stats.total} color="text-slate-400" />
          <StatBox label="Aboard" value={stats.boarded} color="text-emerald-500" highlight />
          <StatBox label="Missing" value={stats.missing} color="text-rose-500" />
        </div>
      </div>

      {/* --- FILTER TABS --- */}
      <div className="flex gap-2 p-6 overflow-x-auto no-scrollbar">
        {['all', 'pending', 'boarded'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 border border-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- STUDENT LIST --- */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-32">
        <AnimatePresence mode="popLayout">
          {students
            .filter(s => activeTab === 'all' || (activeTab === 'pending' && s.status === 'pending') || (activeTab === 'boarded' && s.status === 'on-board'))
            .map((student) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={student.id}
                className={`p-4 rounded-[2rem] border transition-all flex items-center justify-between ${
                  student.status === 'on-board' 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : student.status === 'absent'
                  ? 'bg-rose-500/10 border-rose-500/20 opacity-60'
                  : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={student.photo} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                    {student.status === 'on-board' && (
                      <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 border-4 border-[#0A0C10]">
                        <CheckBadgeSolid className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{student.name}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grade {student.grade}</p>
                    {student.notes && (
                      <div className="flex items-center gap-1 mt-1 text-amber-500">
                        <InformationCircleIcon className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase">{student.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {student.status === 'pending' && (
                    <button 
                      onClick={() => markAbsent(student.id)}
                      className="p-4 bg-white/5 rounded-2xl text-slate-500 border border-white/5"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                  )}
                  <button 
                    onClick={() => toggleStatus(student.id)}
                    className={`p-4 rounded-2xl border transition-all ${
                      student.status === 'on-board'
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-blue-600 text-white border-blue-500'
                    }`}
                  >
                    {student.status === 'on-board' ? (
                      <CheckCircleIcon className="h-6 w-6 font-bold" />
                    ) : (
                      <span className="text-xs font-black uppercase px-2">Board</span>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* --- ACTION FOOTER --- */}
      <div className="p-6 bg-gradient-to-t from-black to-transparent absolute bottom-0 left-0 right-0">
        <button 
          onClick={onComplete}
          disabled={stats.boarded === 0}
          className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
        >
          <ShieldCheckIcon className="h-7 w-7 text-blue-600" />
          {stats.missing === 0 ? "ALL ABOARD - DEPART" : "CONFIRM & DEPART"}
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, highlight }: any) {
  return (
    <div className={`p-4 rounded-2xl border ${highlight ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10'}`}>
      <p className={`text-[9px] font-black uppercase tracking-tighter ${highlight ? 'text-black/60' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-2xl font-black italic leading-none mt-1 ${highlight ? 'text-black' : color}`}>{value}</p>
    </div>
  );
}