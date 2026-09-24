"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function CustomerLogisticsProfilePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [activeTab, setActiveTab] = useState<"active" | "history" | "profile">("active");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/site/${slug}/me/logistics`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load customer profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, slug]);

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-6">
          <TruckIcon className="w-16 h-16 text-cyan-400 mx-auto" />
          <h2 className="text-2xl font-black">Customer Logistics Portal</h2>
          <p className="text-xs text-slate-400">
            Please sign in to monitor your active consignments, request pickups, and view proof of delivery.
          </p>
          <Link
            href={`/auth/signin?callbackUrl=/site/${slug}/logistics/profile`}
            className="block w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Top Profile Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-900/60 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-2xl">
              {session?.user?.name?.[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                Logistics Client
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {session?.user?.name || "Customer Account"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">{session?.user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/site/${slug}/logistics/book`}
              className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg"
            >
              <PlusIcon className="w-4 h-4" /> Book Delivery
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: `/site/${slug}` })}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Active Consignments"
            value={data?.stats?.activeCount ?? 0}
            icon={<TruckIcon className="text-cyan-400" />}
          />
          <StatCard
            label="Delivered"
            value={data?.stats?.completedCount ?? 0}
            icon={<CheckCircleIcon className="text-emerald-400" />}
          />
          <StatCard
            label="Total Shipments"
            value={data?.stats?.totalDeliveries ?? 0}
            icon={<ClockIcon className="text-blue-400" />}
          />
          <StatCard
            label="Freight Billed"
            value={`$${(data?.stats?.totalSpent ?? 0).toFixed(2)}`}
            icon={<DocumentTextIcon className="text-purple-400" />}
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 space-x-8">
          {[
            { id: "active", label: `Active Consignments (${data?.activeDeliveries?.length ?? 0})` },
            { id: "history", label: `Delivery History (${data?.completedDeliveries?.length ?? 0})` },
            { id: "profile", label: "Saved Addresses & Details" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-xs font-black uppercase tracking-wider relative transition-colors ${
                activeTab === tab.id ? "text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* ACTIVE DELIVERIES TAB */}
          {activeTab === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="py-16 text-center text-slate-500">
                  <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-400" />
                  Loading active consignments...
                </div>
              ) : data?.activeDeliveries?.length === 0 ? (
                <div className="py-16 text-center border border-white/5 bg-slate-900/40 rounded-3xl space-y-4">
                  <TruckIcon className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No Active Shipments</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You currently have no active deliveries en route. Schedule a new pickup anytime.
                  </p>
                  <Link
                    href={`/site/${slug}/logistics/book`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-cyan-400 transition-colors"
                  >
                    Schedule Dispatch Now
                  </Link>
                </div>
              ) : (
                data?.activeDeliveries?.map((d: any) => (
                  <div
                    key={d.id}
                    className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-black text-cyan-400">
                          {d.trackingNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                          {d.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white">{d.packageDescription}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-3.5 h-3.5 text-slate-500" /> {d.deliveryAddress}
                        </span>
                        {d.driver && <span>Courier: {d.driver}</span>}
                      </div>
                    </div>

                    <Link
                      href={`/site/${slug}/logistics/trackorder?tracking=${d.trackingNumber}`}
                      className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-cyan-400 flex items-center gap-2 shrink-0 transition-all"
                    >
                      Track Live <ChevronRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {data?.completedDeliveries?.length === 0 ? (
                <div className="py-16 text-center border border-white/5 bg-slate-900/40 rounded-3xl text-slate-500 text-xs">
                  No completed delivery history on file yet.
                </div>
              ) : (
                data?.completedDeliveries?.map((d: any) => (
                  <div
                    key={d.id}
                    className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-white">
                          {d.trackingNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{d.packageDescription}</p>
                      <p className="text-[11px] text-slate-500">
                        Delivered on: {new Date(d.deliveredAt).toLocaleDateString()} to {d.deliveryAddress}
                      </p>
                      {d.hasProof && (
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                          <ShieldCheckIcon className="w-3.5 h-3.5" /> Handover confirmed by{" "}
                          {d.proofRecipient || "Recipient"}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/site/${slug}/logistics/trackorder?tracking=${d.trackingNumber}`}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 shrink-0"
                    >
                      View Receipt & Proof
                    </Link>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* PROFILE & SAVED ADDRESSES TAB */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 space-y-6">
                <h3 className="text-lg font-black text-white">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Name</span>
                    <p className="text-sm font-bold text-white mt-1">{session?.user?.name || "N/A"}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Email</span>
                    <p className="text-sm font-bold text-white mt-1">{session?.user?.email || "N/A"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl">
      <div className="w-5 h-5 mb-3 opacity-90">{icon}</div>
      <p className="text-xl font-black text-white font-mono">{value}</p>
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">{label}</p>
    </div>
  );
}