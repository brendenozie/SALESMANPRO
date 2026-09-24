"use client";

import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface CheckInRecord {
  id: string;
  checkInTime: string;
  status: string;
  method: string;
  notes?: string;
  consumer?: {
    membershipType?: string;
    membershipStatus?: string;
    user?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };
  location?: {
    name?: string;
  };
}

export default function FitnessOperationsMonitor({ companyId }: { companyId: string }) {
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCheckIns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fitness/check-in?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setCheckIns(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load check-ins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCheckIns();
    }
  }, [companyId]);

  const filtered = checkIns.filter((ci) => {
    const name = ci.consumer?.user?.name?.toLowerCase() || "";
    const email = ci.consumer?.user?.email?.toLowerCase() || "";
    const loc = ci.location?.name?.toLowerCase() || "";
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || loc.includes(q);
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-emerald-500" />
            Live Gym Check-In Monitor
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time physical attendance and membership access verification log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search member or facility..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={fetchCheckIns}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            title="Refresh logs"
          >
            <ArrowPathIcon className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-400">Loading live check-ins...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-400">
          No check-ins recorded for this period yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] tracking-wider text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Membership</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((ci) => (
                <tr key={ci.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {ci.consumer?.user?.name || "Member"}
                    <span className="block text-[10px] text-zinc-400 font-normal">
                      {ci.consumer?.user?.email || "No email"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">
                      {ci.consumer?.membershipType || "Standard"}
                    </span>
                  </td>
                  <td className="py-3 px-4">{ci.location?.name || "Main Gym"}</td>
                  <td className="py-3 px-4 uppercase text-[10px] text-zinc-400">{ci.method}</td>
                  <td className="py-3 px-4">
                    {ci.status === "SUCCESS" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircleIcon className="w-4 h-4" /> Granted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
                        <XCircleIcon className="w-4 h-4" /> {ci.status.replace("DENIED_", "")}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-400">
                    {new Date(ci.checkInTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
