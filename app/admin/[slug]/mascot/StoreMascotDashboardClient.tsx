"use client";

/**
 * app/admin/[slug]/mascot/StoreMascotDashboardClient.tsx
 *
 * Unified Mascot Operations Dashboard for Store Owners and Administrators.
 * Tenant-isolated with dynamic Light/Dark theme support, responsive layout,
 * interactive quick action prompts, filterable tasks/approvals, and robust error handling.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  KeyIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";

interface Props {
  companyId: string;
  storeSlug: string;
  storeName: string;
  userRole: string;
  userId: string;
  initialTab?: string;
  bannerNotice?: { type: "success" | "error"; message: string };
}

type TabType = "overview" | "tasks" | "integrations" | "approvals" | "activity" | "settings";

export default function StoreMascotDashboardClient({
  companyId,
  storeSlug,
  storeName,
  userRole,
  userId,
  initialTab = "overview",
  bannerNotice,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>((initialTab as TabType) || "overview");
  const [banner, setBanner] = useState(bannerNotice);

  // Data states
  const [loading, setLoading] = useState(true);
  const [creditBalance, setCreditBalance] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filter & Search states
  const [taskFilter, setTaskFilter] = useState<string>("ALL");
  const [approvalFilter, setApprovalFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Load store mascot data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ctxRes, tasksRes, integRes, appRes] = await Promise.all([
        fetch(`/api/ai/mascot/context?companyId=${companyId}`),
        fetch(`/api/ai/mascot/tasks?companyId=${companyId}&limit=20`),
        fetch(`/api/integrations/overview?companyId=${companyId}`),
        fetch(`/api/ai/mascot/approvals?companyId=${companyId}&status=ALL`),
      ]);

      const [ctxData, tasksData, integData, appData] = await Promise.all([
        ctxRes.json().catch(() => ({ success: false })),
        tasksRes.json().catch(() => ({ success: false })),
        integRes.json().catch(() => ({ success: false })),
        appRes.json().catch(() => ({ success: false })),
      ]);

      if (ctxData.success) {
        setCreditBalance(ctxData.context?.aiCreditBalance || 0);
      }

      if (tasksData.success && Array.isArray(tasksData.tasks)) {
        setTasks(tasksData.tasks);
        const events: any[] = [];
        tasksData.tasks.forEach((t: any) => {
          events.push({
            id: `created_${t.id}`,
            timestamp: t.createdAt,
            title: `Task Queued: ${t.title}`,
            type: "TASK_QUEUED",
            badge: t.status,
          });
          if (t.completedAt) {
            events.push({
              id: `completed_${t.id}`,
              timestamp: t.completedAt,
              title: `Task Completed: ${t.title}`,
              type: "TASK_COMPLETED",
              badge: "COMPLETED",
            });
          }
        });
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivityFeed(events);
      }

      if (integData.success && Array.isArray(integData.integrations)) {
        setIntegrations(integData.integrations);
      }

      if (appData.success && Array.isArray(appData.approvals)) {
        setApprovals(appData.approvals);
      }
    } catch (err) {
      console.error("[MASCOT_DASHBOARD_FETCH_ERROR]", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle Approval Action
  const handleApprovalDecision = async (approvalId: string, action: "APPROVE" | "REJECT") => {
    setActionInProgress(approvalId);
    try {
      const res = await fetch("/api/ai/mascot/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId, action, companyId }),
      });
      const data = await res.json();
      if (data.success) {
        setBanner({
          type: "success",
          message: action === "APPROVE" ? "Action authorized and executed successfully!" : "Action was rejected.",
        });
        fetchData();
      } else {
        setBanner({ type: "error", message: data.error || "Approval decision could not be processed." });
      }
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "Network error while processing approval." });
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Verify Probe
  const handleVerifyIntegration = async (provider: string, accountId: string) => {
    setActionInProgress(`verify_${provider}`);
    try {
      const res = await fetch("/api/integrations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, accountId, companyId }),
      });
      const data = await res.json();
      if (data.success && data.result?.healthy) {
        setBanner({ type: "success", message: `Connection probe succeeded: ${data.result.message || "Active & operational."}` });
      } else {
        setBanner({ type: "error", message: `Verification notice: ${data.result?.message || "Check API credentials."}` });
      }
      fetchData();
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "Verification request failed." });
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Disconnect
  const handleDisconnectIntegration = async (provider: string, accountId: string) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}? Automated publishing and sync will stop immediately.`)) {
      return;
    }
    setActionInProgress(`disconnect_${provider}`);
    try {
      const res = await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, accountId, companyId }),
      });
      const data = await res.json();
      if (data.success) {
        setBanner({ type: "success", message: `${provider} was disconnected successfully.` });
        fetchData();
      } else {
        setBanner({ type: "error", message: data.error || "Disconnection failed." });
      }
    } catch (err: any) {
      setBanner({ type: "error", message: err.message || "Network error while disconnecting." });
    } finally {
      setActionInProgress(null);
    }
  };

  // Quick prompt execution trigger
  const triggerMascotPrompt = (query: string) => {
    const event = new CustomEvent("salesmanpro:mascot:send", { detail: { message: query } });
    window.dispatchEvent(event);
  };

  // Quick Stats
  const activeTasksCount = tasks.filter((t) => ["RUNNING", "QUEUED", "AWAITING_APPROVAL", "RETRYING"].includes(t.status)).length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === "PENDING").length;
  const connectedIntegrationsCount = integrations.filter((i) => i.isConnected).length;
  const completedTodayCount = tasks.filter((t) => t.status === "COMPLETED").length;

  // Filtered lists
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = taskFilter === "ALL" || task.status === taskFilter;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            task.taskType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, taskFilter, searchQuery]);

  const filteredApprovals = useMemo(() => {
    return approvals.filter((app) => {
      const matchesStatus = approvalFilter === "ALL" || app.status === approvalFilter;
      const matchesSearch = app.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.actionType?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [approvals, approvalFilter, searchQuery]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top Banner Notice */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className={`p-4 rounded-2xl flex items-center justify-between border shadow-lg backdrop-blur-md ${
              banner.type === "success"
                ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-xl ${banner.type === "success" ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                {banner.type === "success" ? (
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold">{banner.message}</span>
            </div>
            <button
              onClick={() => setBanner(undefined)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner Hub */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 dark:from-indigo-950 dark:via-slate-900 dark:to-black border border-indigo-500/30 p-6 md:p-8 shadow-2xl text-white">
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shadow-inner backdrop-blur-md shrink-0">
              <SparklesIcon className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-md border border-indigo-400/20">
                  AI Operations Command
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Mascot Online
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                {storeName} AI Operations Hub
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-2xl font-medium">
                Delegate marketing, sync multi-channel socials, monitor execution logs, and authorize sensitive tasks seamlessly.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 dark:bg-slate-800/80 border border-white/10 dark:border-slate-700/60 backdrop-blur-md">
              <span className="text-[10px] font-bold text-indigo-200 dark:text-slate-400 uppercase tracking-wider block">
                AI Credit Balance
              </span>
              <span className="text-lg font-black text-white">{creditBalance.toLocaleString()} Credits</span>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-white/10 dark:border-slate-700/60 text-white transition-all disabled:opacity-50 shadow-sm active:scale-95"
              title="Refresh Dashboard"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-slate-950/40 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Active Tasks</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CpuChipIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{activeTasksCount}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Executing in background</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-slate-950/40 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{pendingApprovalsCount}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Awaiting authorization</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-slate-950/40 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Connected Hubs</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <KeyIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{connectedIntegrationsCount}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Social & payment channels</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-slate-950/40 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{completedTodayCount}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Audited & verified</span>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "overview", label: "Overview", icon: SparklesIcon },
          { id: "tasks", label: `Tasks (${activeTasksCount})`, icon: CpuChipIcon },
          { id: "integrations", label: `Integrations (${connectedIntegrationsCount})`, icon: KeyIcon },
          { id: "approvals", label: `Approvals (${pendingApprovalsCount})`, icon: ShieldCheckIcon },
          { id: "activity", label: "Activity Feed", icon: ClockIcon },
          { id: "settings", label: "Settings", icon: BoltIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border dark:border-indigo-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Mascot Prompts */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Quick Mascot Autonomous Commands
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Click to dispatch prompt</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: "Connect Facebook Page", desc: "Link page for automated promotions", query: "Connect my Facebook page" },
                { title: "Connect Instagram", desc: "Showcase products on Instagram", query: "Help me connect Instagram to my store" },
                { title: "Set Up WhatsApp Business", desc: "Enable 24/7 AI order processing", query: "Set up WhatsApp so customers can place orders" },
                { title: "Check Low Stock Levels", desc: "Audit inventory below reorder points", query: "Check low stock levels across store" },
                { title: "Monthly Sales Performance", desc: "Calculate revenue and margin trends", query: "Show me business performance this month" },
                { title: "Audit Integration Health", desc: "Review services needing reconnect", query: "Show me which accounts still need connecting" },
                { title: "Review Pending Approvals", desc: "Inspect items waiting authorization", query: "Which tasks are waiting for my approval?" },
                { title: "Generate Social Post", desc: "Draft marketing copy and tags", query: "Create a promotional social media post" },
              ].map((act, i) => (
                <button
                  key={i}
                  onClick={() => triggerMascotPrompt(act.query)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {act.title}
                      </p>
                      <PaperAirplaneIcon className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{act.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pending Approvals Callout Banner */}
          {pendingApprovalsCount > 0 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <ShieldCheckIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">
                      {pendingApprovalsCount} Action(s) Require Your Explicit Approval
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                      Human-in-the-loop protection: high-impact marketing or integration steps are paused for authorization.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("approvals")}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shrink-0 active:scale-95"
                >
                  Review Approvals →
                </button>
              </div>
            </div>
          )}

          {/* Connected Integrations Highlights */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <KeyIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Integration Status Overview
              </h3>
              <button
                onClick={() => setActiveTab("integrations")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage All ({integrations.length}) →
              </button>
            </div>

            {integrations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No integrations configured yet. Click "Integrations" to connect Facebook, Instagram, or WhatsApp.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {integrations.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.isConnected ? `Connected: ${item.accountName}` : "Not connected"}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.isConnected
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {item.status || (item.isConnected ? "ACTIVE" : "DISCONNECTED")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. TASKS TAB */}
      {activeTab === "tasks" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Store Background AI Tasks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitor long-running tasks, marketing post schedules, stock audits, and sales reports.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="RUNNING">Running</option>
                <option value="COMPLETED">Completed</option>
                <option value="AWAITING_APPROVAL">Awaiting Approval</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              No matching background tasks found. Try adjusting your filters or dispatch a task via the Mascot!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase font-black tracking-wider text-[10px] text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Task Title</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Queued At</th>
                    <th className="p-3.5 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{task.title}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{task.taskType}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            task.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : task.status === "RUNNING"
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                              : task.status === "AWAITING_APPROVAL"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              : task.status === "FAILED"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">
                        {new Date(task.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <Link
                          href={`/admin/${storeSlug}/ai-tasks`}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold inline-flex items-center gap-1"
                        >
                          Details <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. INTEGRATIONS TAB */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">External Account Connections</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              OAuth and direct API channels. Authorize social publishing and messaging pipelines securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {item.category?.replace("_", " ") || "Integration"}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.isConnected
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {item.status || (item.isConnected ? "CONNECTED" : "DISCONNECTED")}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>

                  {item.isConnected && (
                    <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        Connected Asset
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                        {item.accountName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  {item.isConnected ? (
                    <>
                      <button
                        onClick={() => handleVerifyIntegration(item.id, item.accountId)}
                        disabled={actionInProgress === `verify_${item.id}`}
                        className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all disabled:opacity-50"
                      >
                        {actionInProgress === `verify_${item.id}` ? "Probing..." : "Verify Health"}
                      </button>
                      <button
                        onClick={() => handleDisconnectIntegration(item.id, item.accountId)}
                        disabled={actionInProgress === `disconnect_${item.id}`}
                        className="px-3 py-2 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <a
                      href={`/api/integrations/oauth/${item.id}/connect?companyId=${companyId}&redirectPath=${encodeURIComponent(
                        `/admin/\${storeSlug}/mascot?tab=integrations`
                      )}`}
                      className="w-full py-2.5 px-4 text-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                    >
                      <KeyIcon className="h-4 w-4" />
                      Connect {item.name}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. APPROVALS TAB */}
      {activeTab === "approvals" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Human-in-the-Loop Authorization</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sensitive operations requiring store owner or manager confirmation.
              </p>
            </div>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Approvals</option>
              <option value="PENDING">Pending Only</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {filteredApprovals.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              <CheckCircleIcon className="h-10 w-10 text-emerald-500/40 mx-auto mb-3" />
              All clear! No operations are waiting for authorization under current filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApprovals.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {app.actionType}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Requested: {new Date(app.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.title}</h4>
                    {app.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">{app.description}</p>
                    )}
                  </div>

                  {app.status === "PENDING" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprovalDecision(app.id, "REJECT")}
                        disabled={actionInProgress === app.id}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprovalDecision(app.id, "APPROVE")}
                        disabled={actionInProgress === app.id}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Authorize Action
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border self-start md:self-auto ${
                        app.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {app.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. ACTIVITY TAB */}
      {activeTab === "activity" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Store Activity Timeline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of mascot automated decisions, worker execution events, and decision checkpoints.
            </p>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {activityFeed.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 dark:text-slate-400">No recent mascot activity logged.</p>
            ) : (
              activityFeed.map((evt) => (
                <div key={evt.id} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-2 top-2 h-3.5 w-3.5 rounded-full border-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-950 shrink-0" />
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{evt.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{new Date(evt.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {evt.badge}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Mascot Autonomous Configuration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set publishing policies, human approval thresholds, and permissions for {storeName}.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Social Marketing Publishing Mode</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Require store manager authorization before social media posts go live automatically.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Approval Required
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Mascot Assistant Widget</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Floating mascot assistant enabled for store team and staff.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                Enabled
              </span>
            </div>

            <div className="pt-2">
              <Link
                href={`/admin/${storeSlug}/settings/ai-mascot`}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Open Full Mascot Configuration</span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}