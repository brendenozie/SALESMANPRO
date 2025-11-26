import React from 'react';
import { 
  XMarkIcon, 
  MapPinIcon, 
  CalendarDaysIcon, 
  ShareIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { WalletIcon } from '@heroicons/react/24/solid'; // Using solid for the button

export default function TicketModal({ event, onClose }:{event: {id: number, title: string, date: string, time?: string, location?: string, image: string, category?: string}, onClose: () => void}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Ticket Container */}
      <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-slate-800 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* 1. TOP SECTION: Event Media & Title */}
        <div className="relative h-48">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-block px-2 py-1 mb-2 text-xs font-bold text-black bg-purple-400 rounded-md uppercase tracking-wider">
              {event.category || 'General Admission'}
            </span>
            <h2 className="text-2xl font-bold text-white leading-tight shadow-black drop-shadow-lg">
              {event.title}
            </h2>
          </div>
        </div>

        {/* 2. MIDDLE SECTION: Details */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase font-semibold">Date</span>
              <div className="flex items-center gap-1.5 text-slate-200 mt-1">
                <CalendarDaysIcon className="w-4 h-4 text-purple-500" />
                <span className="font-medium">{event.date}</span>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-slate-500 text-xs uppercase font-semibold">Time</span>
              <span className="font-medium text-slate-200 mt-1">{event.time}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-slate-500 text-xs uppercase font-semibold">Location</span>
            <div className="flex items-center gap-1.5 text-slate-200 mt-1">
              <MapPinIcon className="w-4 h-4 text-purple-500" />
              <span className="font-medium truncate">{event.location}</span>
            </div>
          </div>
          
          {/* Seat Info Grid */}
          <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-800 mt-4">
             <div className="text-center p-2 rounded-lg bg-slate-800/50">
               <span className="block text-xs text-slate-500 uppercase">Gate</span>
               <span className="font-bold text-white">B</span>
             </div>
             <div className="text-center p-2 rounded-lg bg-slate-800/50">
               <span className="block text-xs text-slate-500 uppercase">Row</span>
               <span className="font-bold text-white">12</span>
             </div>
             <div className="text-center p-2 rounded-lg bg-slate-800/50">
               <span className="block text-xs text-slate-500 uppercase">Seat</span>
               <span className="font-bold text-white">4A</span>
             </div>
          </div>
        </div>

        {/* 3. PERFORATION EFFECT */}
        <div className="relative flex items-center justify-between px-4">
          <div className="w-6 h-6 rounded-full bg-slate-950 -ml-7" /> {/* Left Punch Hole */}
          <div className="h-[2px] flex-1 bg-slate-800 border-t border-dashed border-slate-600 mx-2" />
          <div className="w-6 h-6 rounded-full bg-slate-950 -mr-7" /> {/* Right Punch Hole */}
        </div>

        {/* 4. BOTTOM SECTION: QR & Wallet */}
        <div className="bg-white p-6 pb-8 text-center">
            
          {/* Simulated QR Code */}
          <div className="bg-white border-4 border-slate-900 rounded-xl p-2 w-40 h-40 mx-auto mb-4 shadow-xl">
            {/* Using an icon here for demo, usually this is a real QR library */}
            <QrCodeIcon className="w-full h-full text-slate-900" />
          </div>
          
          <p className="text-slate-500 text-xs mb-6">Scan this code at the entrance</p>

          <div className="space-y-3">
            <button className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
              <WalletIcon className="w-5 h-5" />
              Add to Apple Wallet
            </button>
            
            <button className="flex items-center justify-center gap-2 w-full text-slate-600 font-medium py-2 hover:text-slate-900 transition-colors">
              <ShareIcon className="w-4 h-4" />
              Send to a friend
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}