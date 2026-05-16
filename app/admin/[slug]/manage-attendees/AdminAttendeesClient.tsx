"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  TicketIcon,
  UserGroupIcon,
  ArrowPathIcon,
  IdentificationIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

interface AdminAttendeesClientProps {
  companyId: string;
  initialAttendees: any[];
  eventsList: { id: string; title: string }[];
}

export default function AdminAttendeesClient({ companyId, initialAttendees, eventsList }: AdminAttendeesClientProps) {
  const [attendees, setAttendees] = useState<any[]>(initialAttendees);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Runtime context calculation metrics
  const stats = useMemo(() => {
    return {
      total: attendees.length,
      checkedIn: attendees.filter((a) => a.checkInStatus === "CHECKED_IN").length,
      pending: attendees.filter((a) => a.checkInStatus === "PENDING").length,
      vip: attendees.filter((a) => a.ticket?.ticketType === "VIP" || a.ticket?.ticketType === "VVIP").length,
    };
  }, [attendees]);

  // High performance compound memo filtering
  const filteredAttendees = useMemo(() => {
    return attendees.filter((item) => {
      const matchesSearch =
        !search ||
        item.fullName.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.ticketCode.toLowerCase().includes(search.toLowerCase());

      const matchesEvent = !selectedEvent || item.eventId === selectedEvent;
      const matchesStatus = !selectedStatus || item.checkInStatus === selectedStatus;

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [attendees, search, selectedEvent, selectedStatus]);

  // Real-time optimistic UI Check-in Status mutation
  const toggleCheckIn = async (attendeeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "CHECKED_IN" ? "PENDING" : "CHECKED_IN";
    setIsUpdating(attendeeId);

    // Optimistic Update
    const fallbackAttendees = [...attendees];
    setAttendees((prev) =>
      prev.map((a) => (a.id === attendeeId ? { ...a, checkInStatus: nextStatus } : a))
    );

    try {
      const res = await fetch("/api/admin/attendees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId, checkInStatus: nextStatus }),
      });

      if (!res.ok) throw new Error();
    } catch {
      // Revert upon failure profile context
      setAttendees(fallbackAttendees);
      alert("Verification transaction failed to write down stream.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12 font-sans relative overflow-hidden">
      {/* Visual Ambient Atmosphere Backdrops */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Header Layout Component */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
            >
              Ticket <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">Attendees</span>
            </motion.h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">
              Real-time validation framework, identity profiles, and event gate control logs.
            </p>
          </div>
        </div>

        {/* Dynamic Metric Grid Components */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Ticket Holders", val: stats.total, icon: UserGroupIcon, color: "text-indigo-400" },
            { label: "Checked In Pass", val: stats.checkedIn, icon: CheckCircleIcon, color: "text-emerald-400" },
            { label: "Pending Gate Clearance", val: stats.pending, icon: ClockIcon, color: "text-amber-400" },
            { label: "Premium/VIP Access", val: stats.vip, icon: TicketIcon, color: "text-fuchsia-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.02] backdrop-blur-md border border-white/[0.06] p-6 rounded-2xl flex items-center justify-between shadow-xl"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-white mt-1">{stat.val}</p>
              </div>
              <div className={`p-3 bg-white/[0.04] rounded-xl border border-white/[0.08] ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filtering Strategy Control Board */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search holder name, email, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500 text-sm transition"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 py-3 px-4 rounded-xl focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer"
            >
              <option value="">All Scoped Events</option>
              {eventsList.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <FunnelIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/[0.08] text-slate-200 py-3 px-4 rounded-xl focus:outline-none focus:border-indigo-500 text-sm appearance-none cursor-pointer"
            >
              <option value="">All Pass States</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="PENDING">Pending Approval</option>
              <option value="CANCELLED">Cancelled Passes</option>
            </select>
            <FunnelIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Main Workspace Table Architecture */}
        <div className="bg-white/[0.01] backdrop-blur-xl border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/[0.06]">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Holder</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Target Event</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Access Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Passcode Key</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Gate Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Validation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] bg-transparent">
                <AnimatePresence mode="popLayout">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-500 italic text-sm">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <IdentificationIcon className="w-10 h-10 text-slate-600" />
                          <p>No ticket holders matched active search metrics.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((attendee, index) => (
                      <motion.tr
                        key={attendee.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                        className="hover:bg-white/[0.02] transition-colors duration-150 group"
                      >
                        {/* Holder Details */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-sm">
                              {attendee.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                {attendee.fullName}
                              </div>
                              <div className="text-xs text-slate-400">{attendee.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Event Context */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          <span className="truncate max-w-[180px] inline-block">{attendee.event?.title || "Unknown Event"}</span>
                        </td>

                        {/* Ticket Class Tier Badge */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${
                            attendee.ticket?.ticketType === "VIP" || attendee.ticket?.ticketType === "VVIP"
                              ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}>
                            {attendee.ticket?.name || "Regular Pass"}
                          </span>
                        </td>

                        {/* Custom Unique Key Layout */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400">
                          <div className="flex items-center space-x-1.5">
                            <QrCodeIcon className="w-4 h-4 text-slate-500" />
                            <span>{attendee.ticketCode}</span>
                          </div>
                        </td>

                        {/* Check-In Gate Badges */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium gap-1.5 ${
                            attendee.checkInStatus === "CHECKED_IN"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${attendee.checkInStatus === "CHECKED_IN" ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                            {attendee.checkInStatus === "CHECKED_IN" ? "Checked In" : "Pending Gate"}
                          </span>
                        </td>

                        {/* Live Action Toggles */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => toggleCheckIn(attendee.id, attendee.checkInStatus)}
                            disabled={isUpdating === attendee.id}
                            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                              attendee.checkInStatus === "CHECKED_IN"
                                ? "bg-slate-900 border-white/[0.08] text-slate-300 hover:bg-red-950/40 hover:text-red-400 hover:border-red-500/30"
                                : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/10"
                            } disabled:opacity-40`}
                          >
                            {isUpdating === attendee.id ? (
                              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                            ) : attendee.checkInStatus === "CHECKED_IN" ? (
                              <span>Cancel Entry</span>
                            ) : (
                              <span>Check In Pass</span>
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}