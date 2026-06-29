'use client';

import React from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function MessagesView() {
  return (
    <div className="pb-10 h-[calc(100vh-4rem)]">
      <div className="pt-10 px-8 mb-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Messages</h1>
      </div>

      <div className="max-w-7xl mx-auto px-8 h-full">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex h-[600px] overflow-hidden">
          
          {/* Chat Sidebar */}
          <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <ChatContact name="Coach Sarah" active={true} time="10:42 AM" preview="Keep up the great work on your form!" />
              <ChatContact name="Support Team" active={false} time="Yesterday" preview="Your subscription has been updated." />
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">
                S
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Coach Sarah</h3>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                </p>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-6">
              {/* Dummy Messages */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold">S</div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-700 font-medium max-w-md">
                  Hey! I saw your recent bench press PR. Form looked incredibly solid. How are the shoulders feeling today?
                </div>
              </div>
              
              <div className="flex gap-4 justify-end">
                <div className="bg-emerald-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm font-medium max-w-md">
                  Feeling great actually! The warmup routine you suggested completely fixed the pinching issue I had last week.
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors">
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ChatContact({ name, preview, time, active }: any) {
  return (
    <div className={`p-4 rounded-2xl cursor-pointer transition-colors flex gap-4 ${active ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-gray-100'}`}>
      <div className="w-12 h-12 bg-gradient-to-tr from-gray-200 to-gray-300 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gray-500">
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-gray-900 truncate">{name}</h4>
          <span className="text-xs text-gray-400 font-medium">{time}</span>
        </div>
        <p className="text-sm text-gray-500 truncate">{preview}</p>
      </div>
    </div>
  );
}