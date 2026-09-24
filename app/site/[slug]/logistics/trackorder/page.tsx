"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("tracking") || searchParams.get("order") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);

  const fetchTracking = async (searchCode: string) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/logistics/track/${encodeURIComponent(searchCode.trim())}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Unable to locate delivery record");
      }

      setTrackingData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to find tracking information");
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(query);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "OUT_FOR_DELIVERY":
      case "IN_TRANSIT":
      case "PICKED_UP":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "DRIVER_ASSIGNED":
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "PENDING_PAYMENT":
      case "REQUESTED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "FAILED_DELIVERY":
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase">
            <TruckIcon className="w-4 h-4" /> Live Consignment Tracking
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Track Your Delivery
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Real-time status updates, driver location, and verifiable proof of delivery across the logistics network.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative flex items-center bg-slate-900/90 border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-cyan-500/60 transition-colors">
            <MagnifyingGlassIcon className="w-6 h-6 text-slate-400 ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Tracking # (e.g. TRK-xxxx) or Order #"
              className="w-full bg-transparent px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" /> Tracking...
                </>
              ) : (
                "Locate"
              )}
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center max-w-xl mx-auto flex items-center justify-center gap-3"
          >
            <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Tracking Details View */}
        {trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Top Status Card */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Consignment ID
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {trackingData.trackingNumber}
                  </h2>
                </div>
                <div
                  className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider ${getStatusColor(
                    trackingData.status
                  )}`}
                >
                  {trackingData.status.replace(/_/g, " ")}
                </div>
              </div>

              {/* Waypoints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <MapPinIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Origin / Pickup
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {trackingData.pickupAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <MapPinIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Delivery Destination
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {trackingData.deliveryAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver & Vehicle */}
              {trackingData.driver && (
                <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{trackingData.driver.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Assigned Courier • {trackingData.driver.vehicle || "Dedicated Unit"}
                      </p>
                    </div>
                  </div>
                  {trackingData.driver.phone && (
                    <a
                      href={`tel:${trackingData.driver.phone}`}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-cyan-400"
                    >
                      Call Driver: {trackingData.driver.phone}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Proof of Delivery (if completed) */}
            {trackingData.proofOfDelivery && (
              <div className="p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheckIcon className="w-7 h-7 text-emerald-400" />
                  <div>
                    <h3 className="text-lg font-black text-white">Verified Proof of Delivery</h3>
                    <p className="text-xs text-emerald-400/80">
                      Confirmed received by {trackingData.proofOfDelivery.recipientName} on{" "}
                      {new Date(trackingData.proofOfDelivery.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {trackingData.proofOfDelivery.notes && (
                  <p className="text-xs text-slate-300 italic bg-black/40 p-4 rounded-xl border border-white/5">
                    "{trackingData.proofOfDelivery.notes}"
                  </p>
                )}
              </div>
            )}

            {/* Tracking Milestones Timeline */}
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 shadow-2xl">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-cyan-400" /> Consignment Journey Log
              </h3>

              <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {trackingData.timeline.map((event: any, idx: number) => (
                  <div key={event.id || idx} className="relative flex items-start gap-4 pl-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-500 border-4 border-[#07090E] shrink-0 z-10" />
                    <div className="flex-1 bg-white/5 border border-white/5 p-4 rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {event.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.location && (
                        <p className="text-xs text-cyan-400/90 font-medium">
                          Location: {event.location}
                        </p>
                      )}
                      {event.note && (
                        <p className="text-xs text-slate-300 mt-1">{event.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
