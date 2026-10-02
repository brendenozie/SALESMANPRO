"use client";

/**
 * app/admin/[slug]/mascot/StoreMascotDashboardClient.tsx
 *
 * Unified Mascot Operations Dashboard for Store Owners and Administrators.
 * Strictly tenant-isolated: only queries and manipulates data for this store.
 */

import React, { useState, useEffect, useCallback } from "react";
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
  ShareIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  PlayIcon,
  PauseIcon,
  BanknotesIcon,
  EnvelopeIcon,
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
        ctxRes.json(),
        tasksRes.json(),
        integRes.json(),
        appRes.json(),
      ]);

      if (ctxData.success) {
        setCreditBalance(ctxData.context.aiCreditBalance || 0);
      }
      if (tasksData.success && Array.isArray(tasksData.tasks)) {
        setTasks(tasksData.tasks);
        // Build activity feed from task checkpoints & audits
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
    const interval = setInterval(fetchData, 10000); // 10s live refresh
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
        setBanner({ type: "error", message: data.error || "Approval failed." });
      }
    } catch (err: any) {
      setBanner({ type: "error", message: err.message });
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
        setBanner({ type: "success", message: `Connection probe succeeded: ${data.result.message}` });
      } else {
        setBanner({ type: "error", message: `Verification notice: ${data.result?.message || "Check credentials."}` });
      }
      fetchData();
    } catch (err: any) {
      setBanner({ type: "error", message: err.message });
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Disconnect
  const handleDisconnectIntegration = async (provider: string, accountId: string) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}? Automated publishing will be stopped.`)) {
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
      setBanner({ type: "error", message: err.message });
    } finally {
      setActionInProgress(null);
    }
  };

  // Quick Stats
  const activeTasksCount = tasks.filter((t) => ["RUNNING", "QUEUED", "AWAITING_APPROVAL", "RETRYING"].includes(t.status)).length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === "PENDING").length;
  const connectedIntegrationsCount = integrations.filter((i) => i.isConnected).length;
  const completedTodayCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between border ${
              banner.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {banner.type === "success" ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-medium">{banner.message}</span>
            </div>
            <button
              onClick={() => setBanner(undefined)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Hub Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
              <SparklesIcon className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                  Store AI Operations Hub
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Mascot Active
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {storeName} AI Operations & Integrations
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
                Delegate autonomous marketing, connect Facebook, Instagram, WhatsApp, and manage approvals safely.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                AI Credit Balance
              </span>
              <span className="text-lg font-black text-white">{creditBalance.toLocaleString()} Credits</span>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tasks</span>
            <CpuChipIcon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{activeTasksCount}</div>
          <span className="text-[11px] text-slate-500">Currently executing in background</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingApprovalsCount}</div>
          <span className="text-[11px] text-slate-500">Awaiting your authorization</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Connected Accounts</span>
            <KeyIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{connectedIntegrationsCount}</div>
          <span className="text-[11px] text-slate-500">Facebook, WhatsApp & Payments</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tasks Completed</span>
            <CheckCircleIcon className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{completedTodayCount}</div>
          <span className="text-[11px] text-slate-500">Verified and audited</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Overview", icon: SparklesIcon },
          { id: "tasks", label: `Tasks (${activeTasksCount})`, icon: CpuChipIcon },
          { id: "integrations", label: `Integrations (${connectedIntegrationsCount})`, icon: KeyIcon },
          { id: "approvals", label: `Approvals (${pendingApprovalsCount})`, icon: ShieldCheckIcon },
          { id: "activity", label: "Activity Timeline", icon: ClockIcon },
          { id: "settings", label: "Mascot Settings", icon: BoltIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
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
          {/* Quick Mascot Conversational Prompts */}
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-indigo-400" />
                Ask Mascot to Run Store Operations
              </h3>
              <span className="text-xs text-slate-400">Click any action to begin</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: "Connect Facebook Page", desc: "Link page for automatic promotions", query: "Connect my Facebook page" },
                { title: "Connect Instagram", desc: "Showcase products on Instagram", query: "Help me connect Instagram to my store" },
                { title: "Set Up WhatsApp Business", desc: "Enable 24/7 AI order processing", query: "Set up WhatsApp so customers can place orders" },
                { title: "Check Low Stock Levels", desc: "Audit inventory below reorder points", query: "Check low stock levels across store" },
                { title: "Monthly Sales Report", desc: "Calculate revenue and margin trends", query: "Show me business performance this month" },
                { title: "Check Connections", desc: "Review which services need attention", query: "Show me which accounts still need connecting" },
                { title: "Review Approvals", desc: "Inspect pending actions waiting authorization", query: "Which tasks are waiting for my approval?" },
                { title: "Draft Marketing Post", desc: "Generate promotional campaign copy", query: "Create a promotional social media post" },
              ].map((act, i) => (
                <button
                  key={i}
                  onClick={() => {
                    // Trigger Mascot chat with this prompt
                    const event = new CustomEvent("salesmanpro:mascot:send", { detail: { message: act.query } });
                    window.dispatchEvent(event);
                  }}
                  className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300">{act.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{act.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Pending Approvals Callout (If any) */}
          {pendingApprovalsCount > 0 && (
            <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-6 w-6 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-black text-amber-400">
                      {pendingApprovalsCount} Action(s) Require Your Approval
                    </h3>
                    <p className="text-xs text-amber-200/70">
                      Human-in-the-loop protection: sensitive operations will not execute without authorization.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("approvals")}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  Review All Approvals
                </button>
              </div>
            </div>
          )}

          {/* Connected Integrations Highlights */}
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <KeyIcon className="h-4 w-4 text-emerald-400" />
                Integration Status Overview
              </h3>
              <button
                onClick={() => setActiveTab("integrations")}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                Manage All Integrations →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {integrations.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.isConnected ? `Connected: ${item.accountName}` : "Not connected"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.isConnected
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-700 text-slate-400 border-slate-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. TASKS TAB */}
      {activeTab === "tasks" && (
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Store Background AI Tasks</h3>
              <p className="text-xs text-slate-400">
                Track long-running tasks, reports, stock audits, and marketing schedules.
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No tasks have been queued yet. Ask the mascot to run an audit or generate a report!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase font-black tracking-wider text-[10px] text-slate-400">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Task Title</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Started</th>
                    <th className="p-3.5 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white">{task.title}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">{task.taskType}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            task.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : task.status === "RUNNING"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              : task.status === "AWAITING_APPROVAL"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : task.status === "FAILED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-slate-700 text-slate-400 border-slate-600"
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(task.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <Link
                          href={`/admin/${storeSlug}/ai-tasks`}
                          className="text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          View Details →
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">External Account Connections</h3>
              <p className="text-xs text-slate-400">
                Official OAuth and API integrations. Connect your store assets with least-privilege permissions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {item.category.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.isConnected
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>

                  {item.isConnected && (
                    <div className="mt-4 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Connected Asset
                      </span>
                      <span className="text-xs font-bold text-white">{item.accountName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {item.isConnected ? (
                    <>
                      <button
                        onClick={() => handleVerifyIntegration(item.id, item.accountId)}
                        disabled={actionInProgress === `verify_${item.id}`}
                        className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all disabled:opacity-50"
                      >
                        {actionInProgress === `verify_${item.id}` ? "Probing..." : "Verify Health"}
                      </button>
                      <button
                        onClick={() => handleDisconnectIntegration(item.id, item.accountId)}
                        disabled={actionInProgress === `disconnect_${item.id}`}
                        className="px-3 py-2 text-xs font-bold rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <a
                      href={`/api/integrations/oauth/${item.id}/connect?companyId=${companyId}&redirectPath=${encodeURIComponent(
                        `/admin/${storeSlug}/mascot?tab=integrations`
                      )}`}
                      className="w-full py-2.5 px-4 text-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
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
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-black text-white">Human-in-the-Loop Approvals</h3>
            <p className="text-xs text-slate-400">
              Operations requiring your explicit authorization before execution.
            </p>
          </div>

          {approvals.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <CheckCircleIcon className="h-10 w-10 text-emerald-500/40 mx-auto mb-3" />
              All clear! No operations are waiting for authorization.
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {app.actionType}
                      </span>
                      <span className="text-xs text-slate-400">
                        Requested: {new Date(app.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{app.title}</h4>
                    {app.description && (
                      <p className="text-xs text-slate-400">{app.description}</p>
                    )}
                  </div>

                  {app.status === "PENDING" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprovalDecision(app.id, "REJECT")}
                        disabled={actionInProgress === app.id}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprovalDecision(app.id, "APPROVE")}
                        disabled={actionInProgress === app.id}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Authorize Action
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        app.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
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
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-black text-white">Store Activity Timeline</h3>
            <p className="text-xs text-slate-400">
              Audit log of mascot decisions, worker task execution, and authorized actions.
            </p>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
            {activityFeed.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No activity recorded yet.</p>
            ) : (
              activityFeed.map((evt) => (
                <div key={evt.id} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-indigo-500 bg-slate-950 shrink-0" />
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{evt.title}</p>
                      <p className="text-[11px] text-slate-400">{new Date(evt.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
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
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-black text-white">Mascot Autonomous Settings</h3>
            <p className="text-xs text-slate-400">
              Configure publishing modes, approval thresholds, and feature permissions for {storeName}.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Social Marketing Publishing Mode</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Require human review before posts go live to connected Facebook or Instagram accounts.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Approval Required
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">AI Mascot Assistant State</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Floating mascot enabled for store staff and administrators.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Enabled
              </span>
            </div>

            <div className="pt-4">
              <Link
                href={`/admin/${storeSlug}/settings/ai-mascot`}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors inline-block"
              >
                Open Full Mascot Configuration →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
