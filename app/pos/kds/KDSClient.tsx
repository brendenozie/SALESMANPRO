'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FireIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowUturnLeftIcon,
  TableCellsIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export interface KDSTicketItem {
  id: string;
  name: string;
  quantity: number;
  course: string;
  kitchenStatus: string;
  notes?: string;
  options?: { category: string; name: string }[];
  station: 'KITCHEN' | 'BAR';
}

export interface KDSTicket {
  id: string;
  orderNumber: string;
  tableNumber: string;
  guestCount: number;
  serviceMode: string;
  cashierName: string;
  kitchenStatus: string;
  createdAt: string;
  kitchenSentAt: string;
  elapsedMinutes: number;
  urgency: 'normal' | 'warning' | 'critical';
  items: KDSTicketItem[];
}

export default function KDSClient({ companyId, initialStation = 'ALL' }: { companyId: string; initialStation?: string }) {
  const [station, setStation] = useState<'ALL' | 'KITCHEN' | 'BAR' | 'EXPO'>(initialStation as any);
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const prevTicketCountRef = useRef<number>(0);

  // Play audio chime using Web Audio API synthesize
  const playChime = useCallback(() => {
    if (!isAudioEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, [isAudioEnabled]);

  const fetchTickets = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await fetch(
        `/api/pos/kds?companyId=${companyId}&station=${station}&showCompleted=${showCompleted}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        // If new tickets arrived, chime
        if (data.tickets.length > prevTicketCountRef.current && prevTicketCountRef.current > 0) {
          playChime();
        }
        prevTicketCountRef.current = data.tickets.length;
        setTickets(data.tickets);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('[KDS] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, station, showCompleted, playChime]);

  // Initial and periodic polling (every 6 seconds)
  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 6000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // Update status (e.g. SENT -> PREPARING -> READY -> SERVED)
  const handleUpdateStatus = async (orderId: string, nextStatus: string, itemId?: string) => {
    try {
      // Optimistic local update
      setTickets((prev) =>
        prev
          .map((t) => {
            if (t.id !== orderId) return t;
            if (itemId) {
              return {
                ...t,
                items: t.items.map((i) => (i.id === itemId ? { ...i, kitchenStatus: nextStatus } : i)),
              };
            }
            return {
              ...t,
              kitchenStatus: nextStatus,
              items: t.items.map((i) => ({ ...i, kitchenStatus: nextStatus })),
            };
          })
          .filter((t) => (showCompleted ? true : nextStatus !== 'SERVED'))
      );

      await fetch('/api/pos/kds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, orderId, itemId, status: nextStatus }),
      });

      // Quick re-sync
      fetchTickets();
    } catch (err) {
      console.error('[KDS] Update error:', err);
    }
  };

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col select-none">
      {/* HEADER BAR */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
              <FireIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-tight flex items-center gap-2">
                Salesman<span className="text-orange-500">KDS</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Live Station
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Active orders: <span className="font-bold text-white">{tickets.length}</span> | Refreshed:{' '}
                {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>

          {/* STATION SELECTOR */}
          <div className="hidden md:flex items-center bg-zinc-800 p-1 rounded-xl border border-zinc-700/60">
            {(['ALL', 'KITCHEN', 'BAR', 'EXPO'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStation(s)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  station === s ? 'bg-orange-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'All Stations' : s === 'KITCHEN' ? 'Kitchen (Food)' : s === 'BAR' ? 'Bar (Drinks)' : 'Expo / Pass'}
              </button>
            ))}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2.5">
          {/* Recall / Completed Toggle */}
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              showCompleted
                ? 'bg-zinc-800 text-white border-zinc-600'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            <span>{showCompleted ? 'Hide Bumped' : 'Recall Recent'}</span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title={isAudioEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          >
            {isAudioEnabled ? <SpeakerWaveIcon className="w-5 h-5 text-emerald-400" /> : <SpeakerXMarkIcon className="w-5 h-5 text-zinc-500" />}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={fetchTickets}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Refresh active tickets"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Toggle Fullscreen"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* TICKETS GRID */}
      <main className="flex-1 p-6 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
              <CheckCircleIcon className="w-10 h-10 text-emerald-500/50" />
            </div>
            <h2 className="text-2xl font-black text-zinc-300">All Orders Bumped & Clear!</h2>
            <p className="text-sm text-zinc-500 max-w-sm mt-1">
              No active tickets waiting at this station. New tickets sent from the POS register will appear instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {tickets.map((ticket) => {
              const isPreparing = ticket.kitchenStatus === 'PREPARING';
              const isReady = ticket.kitchenStatus === 'READY';
              const isServed = ticket.kitchenStatus === 'SERVED';

              // Header color based on urgency / stage
              const headerBg =
                isReady
                  ? 'bg-emerald-600'
                  : ticket.urgency === 'critical'
                  ? 'bg-rose-700 animate-pulse'
                  : ticket.urgency === 'warning'
                  ? 'bg-amber-600'
                  : 'bg-zinc-800';

              const cardBorder =
                isReady
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : ticket.urgency === 'critical'
                  ? 'border-rose-600 ring-2 ring-rose-600/30'
                  : 'border-zinc-800';

              return (
                <div
                  key={ticket.id}
                  className={`bg-zinc-900 rounded-2xl border ${cardBorder} shadow-xl flex flex-col overflow-hidden transition-all`}
                >
                  {/* CARD HEADER */}
                  <div className={`${headerBg} p-3.5 text-white flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-lg">#{ticket.orderNumber}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-black/30 tracking-wider">
                          {ticket.serviceMode.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold opacity-90 mt-0.5">
                        <TableCellsIcon className="w-3.5 h-3.5" />
                        <span>Table {ticket.tableNumber}</span>
                        <span>•</span>
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>{ticket.guestCount} Guests</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 font-mono font-black text-base justify-end">
                        <ClockIcon className="w-4 h-4" />
                        <span>{ticket.elapsedMinutes}m</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        {isReady ? 'READY' : isPreparing ? 'COOKING' : 'NEW TICKET'}
                      </span>
                    </div>
                  </div>

                  {/* ITEMS LIST */}
                  <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[360px] custom-scrollbar">
                    {ticket.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          const next = item.kitchenStatus === 'PENDING' ? 'COOKING' : item.kitchenStatus === 'COOKING' ? 'READY' : 'PENDING';
                          handleUpdateStatus(ticket.id, next, item.id);
                        }}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          item.kitchenStatus === 'READY'
                            ? 'bg-emerald-950/20 border-emerald-800/60 line-through opacity-70'
                            : item.kitchenStatus === 'COOKING'
                            ? 'bg-amber-950/20 border-amber-800/60'
                            : 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-sm text-orange-400 shrink-0">
                          {item.quantity}x
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-zinc-100 leading-snug">{item.name}</p>
                          {item.options && item.options.length > 0 && (
                            <p className="text-xs text-orange-300/90 font-medium mt-0.5">
                              {item.options.map((o) => o.name).join(' • ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-amber-400 italic bg-amber-950/30 px-2 py-0.5 rounded mt-1 border border-amber-900/40">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BUMP ACTIONS */}
                  <div className="p-3 bg-zinc-950/70 border-t border-zinc-800/80 flex gap-2">
                    {!isPreparing && !isReady && !isServed && (
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, 'PREPARING')}
                        className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-md shadow-amber-600/20"
                      >
                        Start Cooking
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, 'READY')}
                        className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-md shadow-teal-600/20"
                      >
                        Mark Ready
                      </button>
                    )}

                    {(isReady || isPreparing) && (
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, 'SERVED')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-md shadow-emerald-600/20"
                      >
                        Bump / Served
                      </button>
                    )}

                    {isServed && (
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, 'PREPARING')}
                        className="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold"
                      >
                        Recall Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
