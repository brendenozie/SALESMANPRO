'use client';

import React, { useState } from 'react';
import { 
  XMarkIcon, 
  MicrophoneIcon, 
  MagnifyingGlassIcon, 
  UserMinusIcon,
  ShieldExclamationIcon,
  StopIcon,
  CheckIcon,
  FaceFrownIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const SEVERITY_LEVELS = [
  { level: 1, label: 'Minor', color: 'bg-blue-500', icon: FaceSmileIcon, desc: 'Verbal warning given' },
  { level: 2, label: 'Moderate', color: 'bg-amber-500', icon: FaceFrownIcon, desc: 'Seat reassigned' },
  { level: 3, label: 'Critical', color: 'bg-rose-600', icon: ShieldExclamationIcon, desc: 'Principal/Parent notified' },
];

export default function BehaviorReportForm({ students, onCancel, onSubmit }: any) {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [severity, setSeverity] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');

  const filteredStudents = students.filter((s: any) => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[#0A0C10] z-[300] flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="p-6 bg-[#12161F] border-b border-white/10 flex justify-between items-center">
        <button onClick={onCancel} className="p-2 text-slate-500"><XMarkIcon className="h-6 w-6" /></button>
        <h2 className="text-sm font-black uppercase tracking-[0.2em]">Behavior Report</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* STEP 1: SELECT STUDENT */}
        <section>
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4 block">1. Identify Student</label>
          {!selectedStudent ? (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
              <input 
                type="text"
                placeholder="Search student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all"
              />
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {filteredStudents.map((s: any) => (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/50 transition-all"
                  >
                    <img src={s.photo} className="w-8 h-8 rounded-lg object-cover" alt="" />
                    <span className="font-bold text-sm">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl">
              <div className="flex items-center gap-4">
                <img src={selectedStudent.photo} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div>
                  <p className="font-black italic">{selectedStudent.name}</p>
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Grade {selectedStudent.grade}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-500 hover:text-white">
                <UserMinusIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </section>

        {/* STEP 2: SEVERITY SELECTION */}
        <section>
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4 block">2. Incident Severity</label>
          <div className="grid grid-cols-3 gap-3">
            {SEVERITY_LEVELS.map((s) => (
              <button
                key={s.level}
                onClick={() => setSeverity(s.level)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  severity === s.level ? `${s.color} border-transparent scale-105 shadow-xl` : 'bg-white/5 border-white/10 text-slate-500'
                }`}
              >
                <s.icon className={`h-6 w-6 ${severity === s.level ? 'text-white' : 'text-slate-500'}`} />
                <span className={`text-[10px] font-black uppercase ${severity === s.level ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
             Action: {SEVERITY_LEVELS.find(s => s.level === severity)?.desc}
          </p>
        </section>

        {/* STEP 3: AUDIO MEMO */}
        <section>
          <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4 block">3. Voice Narrative</label>
          <div className={`p-8 rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center transition-all ${
            isRecording ? 'bg-rose-600/10 border-rose-500' : 'bg-white/5 border-white/10'
          }`}>
            <button 
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => {
                setIsRecording(false);
                setAudioTranscript("Student was standing in the aisle while bus was in motion. Repeated verbal warnings ignored...");
              }}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${
                isRecording ? 'bg-rose-600 animate-pulse' : 'bg-blue-600'
              }`}
            >
              {isRecording ? <StopIcon className="h-10 w-10 text-white" /> : <MicrophoneIcon className="h-10 w-10 text-white" />}
            </button>
            <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
              {isRecording ? 'Recording... Release to stop' : 'Hold to dictate incident'}
            </p>
          </div>
          {audioTranscript && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm text-slate-300 italic">"{audioTranscript}"</p>
            </motion.div>
          )}
        </section>

      </div>

      {/* FOOTER */}
      <div className="p-8 bg-gradient-to-t from-black to-transparent">
        <button 
          onClick={onSubmit}
          disabled={!selectedStudent || !audioTranscript}
          className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl disabled:opacity-20 transition-all active:scale-95"
        >
          SUBMIT REPORT <CheckIcon className="h-7 w-7 text-blue-600" />
        </button>
      </div>
    </div>
  );
}