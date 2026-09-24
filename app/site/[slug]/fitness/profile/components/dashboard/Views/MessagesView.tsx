'use client';

import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface MessagesViewProps {
  slug?: string;
  bookings?: any[];
}

export default function MessagesView({ slug = 'fitness', bookings = [] }: MessagesViewProps) {
  const [messages, setMessages] = useState<{ sender: 'user' | 'trainer'; text: string; time: string }[]>([
    {
      sender: 'trainer',
      text: 'Welcome to your training dashboard! Feel free to ask questions about your workout splits or nutrition here.',
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');

  // Extract any unique trainers from customer's bookings
  const trainers = bookings
    .filter((b) => b.educator && b.educator.user)
    .map((b) => ({
      id: b.educator.id,
      name: b.educator.user.name || 'Personal Trainer',
      role: 'Assigned Trainer',
    }));

  const activeContact = trainers[0] || {
    id: 'facility-coach',
    name: 'Gym Coaching Staff',
    role: 'Fitness Advisory',
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    toast.success('Message sent to coaching staff.');

    // Simulated trainer auto-acknowledgment
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'trainer',
          text: `Thank you for reaching out. We received your note: "${userMsg.text}". Your coach will review your workout data and follow up shortly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="pb-10 h-[calc(100vh-4rem)]">
      <div className="pt-10 px-8 mb-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Trainer Communications</h1>
        <p className="text-gray-500 mt-1 font-medium">Direct messaging with your assigned personal trainers and gym coaches.</p>
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
                  placeholder="Search coaches..." 
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 flex gap-4 cursor-pointer">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold">
                  {activeContact.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-gray-900 truncate">{activeContact.name}</h4>
                    <span className="text-xs text-emerald-600 font-bold">Active</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{activeContact.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-white">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">
                {activeContact.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{activeContact.name}</h3>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected Trainer Channel
                </p>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'trainer' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {activeContact.name.charAt(0)}
                    </div>
                  )}
                  <div 
                    className={`p-4 rounded-2xl shadow-sm text-sm max-w-md ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none font-medium'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-gray-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Send message to ${activeContact.name}...`} 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors shadow-sm"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}