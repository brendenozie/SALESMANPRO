"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCodeIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

type Event = {
  id: string;
  title: string;
  startDateTime: string;
};

type Attendee = {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  checkedIn: boolean;
};

type Message = {
  type: "success" | "error";
  text: string;
};

interface Props {
  adminSlug: string;
  initialEvents: Event[];
}

export default function AdminCheckinClient({ adminSlug, initialEvents }: Props) {
  const [events] = useState<Event[]>(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Runtime context statistics generation
  const activeStats = useMemo(() => {
    if (!selectedEventId) return { total: 0, checkedIn: 0, missing: 0 };
    const total = attendees.length;
    const checkedIn = attendees.filter((a) => a.checkedIn).length;
    return {
      total,
      checkedIn,
      missing: total - checkedIn,
    };
  }, [attendees, selectedEventId]);

  // Fetch attendees based on chosen context
  const fetchAttendeesForEvent = async () => {
    if (!selectedEventId) {
      setAttendees([]);
      return;
    }
    setIsLoadingAttendees(true);
    setError(null);
    try {
      const query = new URLSearchParams({ search: searchTerm }).toString();
      const response = await fetch(
        `/api/admin/events/${selectedEventId}/check-in-attendees?${query}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP Code: ${response.status}`);
      }

      const data: Attendee[] = await response.json();
      setAttendees(data);
    } catch (err: any) {
      setError(err.message || "Failed to download registration roster context files.");
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  // Debounced input watcher logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (selectedEventId && adminSlug) {
        fetchAttendeesForEvent();
      } else {
        setAttendees([]);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [selectedEventId, adminSlug, searchTerm]);

  // Alert dismiss handler
  useEffect(() => {
    if (message) {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = setTimeout(() => setMessage(null), 4000);
    }
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, [message]);

  // Action status mapping transaction handler
  const handleToggleCheckIn = async (registrationId: string, currentCheckedInStatus: boolean) => {
    setUpdatingId(registrationId);
    setError(null);
    try {
      const newStatus = currentCheckedInStatus ? "REGISTERED" : "ATTENDED";
      const response = await fetch(`/api/admin/check-in/${registrationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Mutation execution exception.");
      }

      const result = await response.json();
      
      setMessage({
        type: result.attendee.checkedIn ? "success" : "error",
        text: result.message,
      });

      // Synchronize client-state array changes immediately
      setAttendees((prev) =>
        prev.map((att) =>
          att.id === registrationId ? { ...att, checkedIn: result.attendee.checkedIn } : att
        )
      );
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to mutate access verification index status." });
    } finally {
      setUpdatingId(null);
    }
  };

  const [scanCode, setScanCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;

    setIsScanning(true);
    try {
      const res = await fetch("/api/admin/check-in/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: scanCode.trim(),
          eventId: selectedEventId || undefined,
          companyId: adminSlug,
          autoCheckIn: true,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setMessage({
          type: "error",
          text: result.message || "Invalid ticket code or check-in error.",
        });
      } else {
        setMessage({
          type: "success",
          text: result.message || "Ticket checked in successfully!",
        });
        setScanCode("");
        if (result.data?.attendee?.id) {
          setAttendees((prev) =>
            prev.map((a) =>
              a.id === result.data.attendee.id ? { ...a, checkedIn: true } : a
            )
          );
        }
        fetchAttendeesForEvent();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Scan verification error." });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12 font-sans relative overflow-hidden">
      {/* Dynamic Aesthetic Blur Backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Dynamic Title Structure */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            Entrance <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-500">Gate Check-in</span>
          </motion.h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Live pass matching, digital badge scanning reconciliation, and entry log operations workspace.
          </p>
        </div>

        {/* Instant QR / Ticket Barcode Scanner */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 backdrop-blur-xl border border-indigo-500/30 p-5 rounded-2xl shadow-xl">
          <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-grow w-full">
              <input
                type="text"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                placeholder="Scan QR Code or Type Ticket Pass Code (e.g. 8f24a1...)..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-white font-mono text-sm focus:outline-none focus:border-indigo-400 placeholder:text-slate-500 transition"
                autoFocus
              />
              <QrCodeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <button
              type="submit"
              disabled={isScanning || !scanCode.trim()}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isScanning ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Scan & Check In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Global Dynamic Message/Alert Bar */}
        <div className="h-14 relative w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.98 }}
                className={`w-full p-4 rounded-xl flex items-center gap-3 border text-sm font-medium backdrop-blur-xl ${
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-lg shadow-rose-500/5"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircleIcon className="w-5 h-5 flex-shrink-0 animate-bounce" />
                ) : (
                  <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                )}
                <p>{message.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interactive Filtering Strategy Deck */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="relative">
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setSearchTerm("");
              }}
              className="w-full bg-slate-900 border border-white/[0.08] text-slate-200 py-3.5 px-4 pr-10 rounded-xl focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer hover:bg-slate-900/80 transition"
            >
              <option value="">
                {events.length > 0 ? "—— Select Targeted Production Event ——" : "No Scheduled Contexts Discovered"}
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({new Date(event.startDateTime).toLocaleDateString()})
                </option>
              ))}
            </select>
            <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Query ticket holder name or verified profile email..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!selectedEventId || isLoadingAttendees}
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Live Counter Display Sub-Bar */}
        <AnimatePresence>
          {selectedEventId && !isLoadingAttendees && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { label: "Roster Sync", val: activeStats.total, color: "text-indigo-400", bg: "bg-indigo-500/5" },
                { label: "Inside Gate", val: activeStats.checkedIn, color: "text-emerald-400", bg: "bg-emerald-500/5" },
                { label: "Awaiting", val: activeStats.missing, color: "text-amber-400", bg: "bg-amber-500/5" },
              ].map((c) => (
                <div key={c.label} className={`p-4 rounded-xl border border-white/[0.04] ${c.bg} flex flex-col justify-center items-center text-center`}>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{c.label}</span>
                  <span className={`text-2xl font-black mt-1 ${c.color}`}>{c.val}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace Display Grid Core Logic */}
        <div className="min-h-[300px] relative">
          {error && (
            <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3">
              <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!selectedEventId ? (
            <div className="text-center py-20 text-slate-500 bg-white/[0.01] border border-dashed border-white/[0.06] rounded-2xl flex flex-col items-center justify-center">
              <QrCodeIcon className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
              <p className="text-sm font-medium">Workspace Standby Mode</p>
              <p className="text-xs text-slate-600 mt-1">Select an active production session sequence layout to open terminal channels.</p>
            </div>
          ) : isLoadingAttendees ? (
            <div className="text-center py-20 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex flex-col items-center justify-center">
              <ArrowPathIcon className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="mt-3 text-sm font-semibold text-slate-400">Reconciling internal manifest streams...</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {attendees.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-16 text-slate-500 bg-slate-900/40 rounded-2xl border border-white/[0.04] flex flex-col items-center justify-center"
                  >
                    <UsersIcon className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="text-sm font-medium">No Registrations Discovered</p>
                    <p className="text-xs text-slate-600 mt-0.5">No names match active criteria filters.</p>
                  </motion.div>
                ) : (
                  attendees.map((attendee, idx) => (
                    <motion.div
                      key={attendee.id}
                      layoutId={attendee.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
                      className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 shadow-xl ${
                        attendee.checkedIn
                          ? "bg-emerald-500/[0.02] border-emerald-500/20 shadow-emerald-950/20"
                          : "bg-white/[0.02] border-white/[0.06] shadow-black/40 hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-white tracking-tight truncate max-w-[80%]">
                            {attendee.name}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase flex-shrink-0 ${
                            attendee.ticketType.includes("VIP")
                              ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}>
                            {attendee.ticketType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate font-medium">{attendee.email}</p>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          attendee.checkedIn
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${attendee.checkedIn ? "bg-emerald-400" : "bg-amber-400"}`} />
                          {attendee.checkedIn ? "Passed Gate" : "Awaiting Clearence"}
                        </span>

                        <button
                          onClick={() => handleToggleCheckIn(attendee.id, attendee.checkedIn)}
                          disabled={updatingId === attendee.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight border inline-flex items-center gap-1.5 transition disabled:opacity-40 select-none ${
                            attendee.checkedIn
                              ? "bg-slate-900/80 border-white/[0.08] text-slate-300 hover:bg-rose-950/30 hover:text-rose-400 hover:border-rose-500/30"
                              : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/10"
                          }`}
                        >
                          {updatingId === attendee.id ? (
                            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                          ) : attendee.checkedIn ? (
                            <span>Check Out</span>
                          ) : (
                            <span>Check In</span>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
        
      </div>
    </div>
  );
}