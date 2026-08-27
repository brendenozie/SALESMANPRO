'use client';
import React, { useState } from 'react';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  MagnifyingGlassIcon,
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';

export default function MessagesClientPage({ threads }: any) {
  const [activeThread, setActiveThread] = useState(threads[0]);
  const [message, setMessage] = useState('');

  return (
    <div className="flex h-full">
      {/* Sidebar: Thread List */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search teachers..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread: any) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={`w-full p-4 flex items-center gap-3 transition ${
                activeThread.id === thread.id ? 'bg-white shadow-sm ring-1 ring-slate-100' : 'hover:bg-slate-100/50'
              }`}
            >
              <div className="relative">
                <img src={thread.avatarUrl} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                {thread.online && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-slate-900 truncate">{thread.senderName}</h4>
                  <span className="text-[10px] text-slate-400">{thread.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{thread.lastMessage}</p>
              </div>
              {thread.unreadCount > 0 && (
                <div className="bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {thread.unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={activeThread.avatarUrl} className="w-10 h-10 rounded-xl" alt="" />
            <div>
              <h3 className="font-bold text-slate-900 leading-none">{activeThread.senderName}</h3>
              <span className="text-xs text-indigo-600 font-medium">{activeThread.role}</span>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-50 rounded-lg"><EllipsisVerticalIcon className="h-5 w-5 text-slate-400" /></button>
        </div>

        {/* Messages Placeholder */}
        <div className="flex-1 p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/30">
          <div className="flex flex-col gap-4">
            <div className="self-start max-w-[70%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
              <p className="text-sm text-slate-800">{activeThread.lastMessage}</p>
              <span className="text-[9px] text-slate-400 mt-1 block">2:45 PM</span>
            </div>
            
            <div className="self-end max-w-[70%] bg-indigo-600 p-3 rounded-2xl rounded-tr-none shadow-md text-white">
              <p className="text-sm">Thank you, Mr. Kamau! That is great news. We will keep practicing at home.</p>
              <span className="text-[9px] opacity-70 mt-1 block text-right">2:48 PM</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition"><PaperClipIcon className="h-5 w-5" /></button>
            <input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 px-2"
            />
            <button className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}