"use client";

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  XMarkIcon, 
  MapPinIcon, 
  CalendarDaysIcon, 
  ShareIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { WalletIcon } from '@heroicons/react/24/solid';

interface TicketModalEvent {
  id: string | number;
  eventId?: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  image?: string;
  category?: string;
  ticketCode?: string;
  ticketName?: string;
  attendeeName?: string;
  checkInStatus?: string;
  qrCodeUrl?: string;
  paymentStatus?: string;
}

export default function TicketModal({
  event,
  onClose,
}: {
  event: TicketModalEvent | null;
  onClose: () => void;
}) {
  const [qrCodeData, setQrCodeData] = useState<string>(event?.qrCodeUrl || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!event) return;
    if (event.qrCodeUrl) {
      setQrCodeData(event.qrCodeUrl);
    } else {
      const codeToEncode = event.ticketCode || String(event.id);
      QRCode.toDataURL(codeToEncode, {
        width: 250,
        margin: 1,
        color: { dark: '#090d16', light: '#ffffff' },
      })
        .then((url) => setQrCodeData(url))
        .catch(() => {});
    }
  }, [event]);

  if (!event) return null;

  const isCheckedIn = event.checkInStatus === 'CHECKED_IN';
  const isCancelled = event.checkInStatus === 'CANCELLED';

  const handleCopyCode = () => {
    if (!event.ticketCode) return;
    navigator.clipboard.writeText(event.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Ticket Container */}
      <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-slate-800 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* 1. TOP SECTION: Event Media & Title */}
        <div className="relative h-48">
          <img 
            src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-block px-2.5 py-1 mb-2 text-xs font-bold text-black bg-indigo-400 rounded-md uppercase tracking-wider">
              {event.ticketName || event.category || 'Admission Pass'}
            </span>
            <h2 className="text-2xl font-bold text-white leading-tight shadow-black drop-shadow-lg">
              {event.title}
            </h2>
          </div>
        </div>

        {/* 2. MIDDLE SECTION: Details & Verification Status */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Attendee Pass</span>
              <p className="text-sm font-semibold text-white">{event.attendeeName || 'Primary Ticket Holder'}</p>
            </div>
            <div>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 ${
                isCheckedIn 
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                  : isCancelled
                  ? 'bg-rose-900/60 text-rose-300 border border-rose-500/30'
                  : 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/30'
              }`}>
                {isCheckedIn ? (
                  <>
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Checked In
                  </>
                ) : isCancelled ? (
                  'Cancelled'
                ) : (
                  <>
                    <ShieldCheckIcon className="w-3.5 h-3.5" /> Valid Ticket
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase font-semibold">Date</span>
              <div className="flex items-center gap-1.5 text-slate-200 mt-1">
                <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
                <span className="font-medium">{event.date}</span>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-slate-500 text-xs uppercase font-semibold">Time</span>
              <span className="font-medium text-slate-200 mt-1">{event.time || 'Doors Open'}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-slate-500 text-xs uppercase font-semibold">Location</span>
            <div className="flex items-center gap-1.5 text-slate-200 mt-1">
              <MapPinIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-medium truncate">{event.location || 'Venue TBA'}</span>
            </div>
          </div>
        </div>

        {/* 3. PERFORATION EFFECT */}
        <div className="relative flex items-center justify-between px-4">
          <div className="w-6 h-6 rounded-full bg-slate-950 -ml-7" />
          <div className="h-[2px] flex-1 bg-slate-800 border-t border-dashed border-slate-600 mx-2" />
          <div className="w-6 h-6 rounded-full bg-slate-950 -mr-7" />
        </div>

        {/* 4. BOTTOM SECTION: Real QR & Code */}
        <div className="bg-white p-6 pb-8 text-center text-slate-900">
          {/* Real Scannable QR Code */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-3 w-44 h-44 mx-auto mb-3 shadow-lg flex items-center justify-center">
            {qrCodeData ? (
              <img src={qrCodeData} alt="Scannable Gate Pass QR" className="w-full h-full object-contain" />
            ) : (
              <QrCodeIcon className="w-full h-full text-slate-400 animate-pulse" />
            )}
          </div>

          {event.ticketCode && (
            <div className="mb-4">
              <button
                onClick={handleCopyCode}
                className="font-mono text-xs tracking-wider px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold transition flex items-center justify-center gap-1.5 mx-auto"
                title="Click to copy ticket code"
              >
                <span>{event.ticketCode}</span>
                <span className="text-[10px] text-indigo-600 font-sans">{copied ? '✓ Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          <p className="text-slate-500 text-xs mb-5">Present this QR code or ticket code at the entrance gate.</p>

          <div className="space-y-2">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-md text-sm"
            >
              <WalletIcon className="w-4 h-4" />
              Save or Print Ticket Pass
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}