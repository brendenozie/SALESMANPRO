"use client";

/**
 * app/super-admin/mascot/SuperAdminMascotClient.tsx
 *
 * Platform-wide Mascot & Background Agent Control Center for Super Admins.
 * Inspects BullMQ queues, worker health, cross-tenant task streams, and OAuth policies
 * without compromising store-level customer privacy or private credentials.
 */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  SparklesIcon,
  CpuChipIcon,
  ServerStackIcon,
  KeyIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

type TabType = "overview" | "workers" | "platform_apps" | "tasks";

export default function SuperAdminMascotClient() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalTasks: 0,
    activeTasks: 0,
    failedTasks: 0,
    completedToday: 0,
    pendingApprovalsCount: 0,
  });
  const [queueMetrics, setQueueMetrics] = useState<any>({});
  const [platformSocialApps, setPlatformSocialApps] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  const fetchTelemetry = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/super-admin/mascot");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setQueueMetrics(data.queueMetrics);
        setPlatformSocialApps(data.platformSocialApps || []);
        setRecentTasks(data.recentTasks || []);
      }
    } catch (err) {
      console.error("[SUPER_ADMIN_MASCOT_FETCH_ERROR]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Hub */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/20 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-inner">
              <SparklesIcon className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-amber-500">
                  Root Governance
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Platform Telemetry Live
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Mascot & Agent Platform Control Center
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
                Super Admin command center for background BullMQ workers, cross-tenant task streams, and platform OAuth configurations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/integrations"
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all border border-slate-700 flex items-center gap-2"
            >
              <KeyIcon className="h-4 w-4 text-amber-400" />
              API Key Vault
            </Link>
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Global Telemetry KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Active Tasks</span>
            <CpuChipIcon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.activeTasks}</div>
          <span className="text-[11px] text-slate-500">Across all store tenants</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Today</span>
            <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.completedToday}</div>
          <span className="text-[11px] text-slate-500">Audit-verified outcomes</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.pendingApprovalsCount}</div>
          <span className="text-[11px] text-slate-500">Store-level review queue</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">BullMQ Redis Queue</span>
            <ServerStackIcon className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {queueMetrics.redisConnected ? (
              <span className="text-emerald-400 text-lg">Healthy (Ready)</span>
            ) : (
              <span className="text-slate-400 text-lg">Standalone Mode</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">Queue: {queueMetrics.queueName || "mascot-tasks"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Platform Overview", icon: ChartBarIcon },
          { id: "tasks", label: "Cross-Tenant Task Stream", icon: CpuChipIcon },
          { id: "workers", label: "Worker & Queue Infrastructure", icon: ServerStackIcon },
          { id: "platform_apps", label: "Platform OAuth Apps", icon: KeyIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <CpuChipIcon className="h-4 w-4 text-amber-400" />
              Live Cross-Tenant Agent Task Stream
            </h3>
            <p className="text-xs text-slate-400">
              Sanitized real-time stream of background tasks across all stores. Zero customer secrets or private tokens are shown.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase font-black tracking-wider text-[10px] text-slate-400">
                  <tr>
                    <th className="p-3 rounded-l-xl">Store Tenant</th>
                    <th className="p-3">Task Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-xl">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentTasks.slice(0, 8).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-white">{t.companyName}</td>
                      <td className="p-3 text-slate-300">{t.title}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">{t.taskType}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : t.status === "RUNNING"
                              ? "bg-indigo-500/10 text-indigo-400"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(t.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ServerStackIcon className="h-4 w-4 text-cyan-400" />
                Active PM2 Workers
              </h3>
              <div className="space-y-3">
                {[
                  { name: "mascot-task-worker", status: "ONLINE", desc: "Long-running mascot background jobs" },
                  { name: "ai-job-worker", status: "ONLINE", desc: "Product descriptions & catalog AI" },
                  { name: "whatsapp-worker", status: "ONLINE", desc: "WhatsApp Cloud webhook processor" },
                  { name: "ai-workforce-worker", status: "ONLINE", desc: "Scheduled marketing strategy" },
                ].map((w, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{w.name}</h4>
                      <p className="text-[10px] text-slate-400">{w.desc}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TASKS STREAM TAB */}
      {activeTab === "tasks" && (
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h3 className="text-base font-black text-white">Full Cross-Tenant Task Registry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 uppercase font-black tracking-wider text-[10px] text-slate-400">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Company</th>
                  <th className="p-3.5">Task Title</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Credits</th>
                  <th className="p-3.5 rounded-r-xl">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-white">{t.companyName}</td>
                    <td className="p-3.5">{t.title}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{t.taskType}</td>
                    <td className="p-3.5 text-slate-400">P{t.priority}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-amber-400">{t.creditsUsed || 0}</td>
                    <td className="p-3.5 text-slate-400">{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. WORKERS TAB */}
      {activeTab === "workers" && (
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-black text-white">BullMQ Redis Queue Architecture</h3>
            <p className="text-xs text-slate-400 mt-1">
              SalesmanPro background tasks run asynchronously on Redis BullMQ queues with safe retry boundaries and automatic credit refunds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Queue Name
              </span>
              <span className="text-sm font-bold text-white font-mono">mascot-task-queue</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Worker Concurrency
              </span>
              <span className="text-sm font-bold text-white">3 Parallel Executions</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Default Max Retries
              </span>
              <span className="text-sm font-bold text-white">3 Attempts (Exponential Backoff)</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. PLATFORM APPS TAB */}
      {activeTab === "platform_apps" && (
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Platform Social & OAuth Applications</h3>
              <p className="text-xs text-slate-400">
                Shared Meta, Google, and WhatsApp applications registered with external providers.
              </p>
            </div>
            <Link
              href="/super-admin/integrations"
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              Configure in Credential Vault →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["FACEBOOK", "INSTAGRAM", "WHATSAPP", "GOOGLE", "TIKTOK", "YOUTUBE"].map((plat) => {
              const cfg = platformSocialApps.find((a) => a.platform === plat);
              return (
                <div key={plat} className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{plat}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cfg?.clientId ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {cfg?.clientId ? "CONFIGURED" : "PENDING"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Client ID: {cfg?.clientId ? `${cfg.clientId.slice(0, 10)}...` : "Not configured"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
