'use client';

import React, { useState } from 'react';
import { 
  PaperAirplaneIcon, 
  MegaphoneIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  MicrophoneIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_REPLIES = ["Roger that", "Stuck in traffic", "Arrived at school", "Need assistance"];

export default function MessagesClient({ initialThreads }: any) {
  const [activeThread, setActiveThread] = useState<any>(null);
  const [inputText, setInputText] = useState('');

  const threads = initialThreads || [
    { id: '1', sender: 'Dispatch (Main Office)', lastMsg: 'Route B pickup delayed 10 mins.', time: '2m ago', urgent: true, unread: true },
    { id: '2', sender: 'Driver Group', lastMsg: 'Rain starting on Northside.', time: '15m ago', urgent: false, unread: false },
  ];

  if (activeThread) {
    return (
      <div className="fixed inset-0 bg-[#0A0C10] z-[400] flex flex-col">
        {/* THREAD HEADER */}
        <header className="p-6 bg-[#12161F] border-b border-white/10 flex items-center gap-4">
          <button onClick={() => setActiveThread(null)} className="p-2 bg-white/5 rounded-xl">
            <ChevronLeftIcon className="h-6 w-6 text-slate-400" />
          </button>
          <div>
            <h2 className="font-black italic uppercase text-lg">{activeThread.sender}</h2>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Connected • Live</p>
          </div>
        </header>

        {/* CHAT BUBBLES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="max-w-[80%] bg-white/5 border border-white/10 p-5 rounded-[2rem] rounded-tl-none">
            <p className="text-sm text-slate-300">All drivers: Please be advised of construction on 4th Street. Use the bypass at Miller Rd.</p>
            <span className="text-[9px] font-black text-slate-500 uppercase mt-2 block">08:10 AM</span>
          </div>
          <div className="max-w-[80%] ml-auto bg-blue-600 p-5 rounded-[2rem] rounded-tr-none shadow-xl shadow-blue-900/20">
            <p className="text-sm text-white font-bold tracking-tight">Copy that, Dispatch. Switching to bypass now.</p>
            <span className="text-[9px] font-black text-blue-200 uppercase mt-2 block italic text-right">08:12 AM</span>
          </div>
        </div>

        {/* INPUT & QUICK REPLIES */}
        <footer className="p-6 bg-[#12161F] border-t border-white/10">
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
            {QUICK_REPLIES.map((reply) => (
              <button 
                key={reply}
                onClick={() => setInputText(reply)}
                className="flex-shrink-0 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
              >
                {reply}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <MicrophoneIcon className="h-6 w-6 text-slate-400" />
            </button>
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-blue-500 outline-none"
            />
            <button className="p-4 bg-blue-600 rounded-2xl shadow-lg">
                <PaperAirplaneIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white p-6 pb-24">
      <header className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Comms Hub</h1>
        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1">Direct Line to Dispatch</p>
      </header>

      {/* BROADCAST ALERT SECTION */}
      <div className="mb-10 bg-rose-600/10 border border-rose-500/20 p-6 rounded-[2.5rem] flex items-center gap-6">
        <div className="bg-rose-600 p-4 rounded-2xl animate-pulse">
            <MegaphoneIcon className="h-6 w-6 text-white" />
        </div>
        <div>
            <h3 className="font-black italic uppercase text-rose-500">School-Wide Alert</h3>
            <p className="text-xs font-bold text-rose-200/60 leading-tight">Snow protocols in effect. All PM routes delayed 30m.</p>
        </div>
      </div>

      {/* THREADS LIST */}
      <div className="space-y-4">
        {threads.map((thread: any) => (
          <button 
            key={thread.id}
            onClick={() => setActiveThread(thread)}
            className={`w-full p-6 rounded-[2.5rem] border transition-all flex items-center justify-between group ${
                thread.unread ? 'bg-white/5 border-blue-500/50' : 'bg-white/5 border-white/5'
            }`}
          >
            <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${thread.urgent ? 'bg-rose-600/20 text-rose-500' : 'bg-white/5 text-slate-500'}`}>
                    {thread.id === '1' ? <ChatBubbleLeftRightIcon className="h-6 w-6" /> : <UserGroupIcon className="h-6 w-6" />}
                </div>
                <div className="text-left">
                    <h4 className="font-black italic uppercase text-white flex items-center gap-2">
                        {thread.sender}
                        {thread.unread && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </h4>
                    <p className="text-sm text-slate-400 line-clamp-1 mt-1">{thread.lastMsg}</p>
                </div>
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase group-hover:text-blue-500 transition-colors">
                {thread.time}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}