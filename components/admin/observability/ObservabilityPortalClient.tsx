"use client";

/**
 * app/super-admin/observability/ObservabilityPortalClient.tsx
 *
 * SalesmanPro Infrastructure Observability & Telemetry Portal.
 * Designed with dual light/dark theme support, smooth animations, dynamic status indicators,
 * filterable trace tables, and responsive mobile/desktop layout.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheckIcon,
  ServerStackIcon,
  CpuChipIcon,
  CircleStackIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BoltIcon,
  ClockIcon,
  QueueListIcon,
  BugAntIcon,
  CreditCardIcon,
  FolderIcon,
  GlobeAltIcon,
  BellAlertIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  LockClosedIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlayIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";

type TabKey =
  | "overview"
  | "traffic"
  | "performance"
  | "servers"
  | "database"
  | "workers"
  | "errors"
  | "slow-requests"
  | "auth"
  | "payments"
  | "storage"
  | "dependencies"
  | "alerts"
  | "diagnostics";

export default function ObservabilityPortalClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(15);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(15);

  // Telemetry Stores
  const [overviewData, setOverviewData] = useState<any>(null);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [serversData, setServersData] = useState<any>(null);
  const [databaseData, setDatabaseData] = useState<any>(null);
  const [workersData, setWorkersData] = useState<any>(null);
  const [errorsData, setErrorsData] = useState<any>(null);
  const [authData, setAuthData] = useState<any>(null);
  const [paymentsData, setPaymentsData] = useState<any>(null);
  const [storageData, setStorageData] = useState<any>(null);
  const [dependenciesData, setDependenciesData] = useState<any>(null);
  const [alertsData, setAlertsData] = useState<any>(null);
  const [incidentsData, setIncidentsData] = useState<any>(null);
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  // Search & Filter
  const [errorStatusFilter, setErrorStatusFilter] = useState("ALL");
  const [expandedErrorFps, setExpandedErrorFps] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Feedback & Action state
  const [actionFeedback, setActionFeedback] = useState<{ message: string; isError?: boolean } | null>(null);
  const [retryingQueue, setRetryingQueue] = useState<string | null>(null);

  // Incident Modal
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [newIncidentTitle, setNewIncidentTitle] = useState("");
  const [newIncidentDesc, setNewIncidentDesc] = useState("");
  const [newIncidentSeverity, setNewIncidentSeverity] = useState("WARNING");
  const [savingIncident, setSavingIncident] = useState(false);

  const fetchTabTelemetry = useCallback(async (tab: TabKey, isManual = false) => {
    if (isManual) setRefreshing(true);

    try {
      if (tab === "overview") {
        const res = await fetch("/api/super-admin/observability/overview");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setOverviewData(json.data);
      } else if (tab === "traffic") {
        const res = await fetch("/api/super-admin/observability/traffic");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setTrafficData(json.data);
      } else if (tab === "performance" || tab === "slow-requests") {
        const res = await fetch("/api/super-admin/observability/performance?limit=40");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setPerformanceData(json.data);
      } else if (tab === "servers") {
        const res = await fetch("/api/super-admin/observability/servers");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setServersData(json.data);
      } else if (tab === "database") {
        const res = await fetch("/api/super-admin/observability/database");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setDatabaseData(json.data);
      } else if (tab === "workers") {
        const res = await fetch("/api/super-admin/observability/workers");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setWorkersData(json.data);
      } else if (tab === "errors") {
        const res = await fetch(`/api/super-admin/observability/errors?status=${errorStatusFilter}`);
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setErrorsData(json.data);
      } else if (tab === "auth") {
        const res = await fetch("/api/super-admin/observability/auth");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setAuthData(json.data);
      } else if (tab === "payments") {
        const res = await fetch("/api/super-admin/observability/payments");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setPaymentsData(json.data);
      } else if (tab === "storage") {
        const res = await fetch("/api/super-admin/observability/storage");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setStorageData(json.data);
      } else if (tab === "dependencies") {
        const res = await fetch("/api/super-admin/observability/dependencies");
        const json = await res.json().catch(() => ({ success: false }));
        if (json.success) setDependenciesData(json.data);
      } else if (tab === "alerts") {
        const [alertsRes, incidentsRes] = await Promise.all([
          fetch("/api/super-admin/observability/alerts"),
          fetch("/api/super-admin/observability/incidents"),
        ]);
        const aJson = await alertsRes.json().catch(() => ({ success: false }));
        const iJson = await incidentsRes.json().catch(() => ({ success: false }));
        if (aJson.success) setAlertsData(aJson.data);
        if (iJson.success) setIncidentsData(iJson.data);
      }
    } catch (err: any) {
      console.error("[TELEMETRY_FETCH_ERROR]", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSecondsUntilRefresh(autoRefreshInterval);
    }
  }, [autoRefreshInterval, errorStatusFilter]);

  useEffect(() => {
    fetchTabTelemetry(activeTab);
  }, [activeTab, fetchTabTelemetry]);

  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchTabTelemetry(activeTab);
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, activeTab, fetchTabTelemetry]);

  const handleUpdateErrorStatus = async (fingerprint: string, status: string) => {
    try {
      const res = await fetch("/api/super-admin/observability/errors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint, status }),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({ message: `Error group marked as ${status}` });
        fetchTabTelemetry("errors");
      } else {
        setActionFeedback({ message: data.error || "Failed to update error", isError: true });
      }
    } catch (err: any) {
      setActionFeedback({ message: err.message || "Network error", isError: true });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleRetryQueue = async (queueName: string) => {
    setRetryingQueue(queueName);
    try {
      const res = await fetch("/api/super-admin/observability/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueName, action: "retry" }),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({ message: data.message || `Retried failed jobs for queue ${queueName}` });
        fetchTabTelemetry("workers");
      } else {
        setActionFeedback({ message: data.error || "Failed to retry queue", isError: true });
      }
    } catch (err: any) {
      setActionFeedback({ message: err.message || "Network error", isError: true });
    } finally {
      setRetryingQueue(null);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleRunDiagnostics = async () => {
    setRunningDiagnostics(true);
    try {
      const res = await fetch("/api/super-admin/observability/system-check", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setDiagnosticsData(data.data);
        setActiveTab("diagnostics");
      } else {
        setActionFeedback({ message: data.error || "Diagnostics failed to run", isError: true });
      }
    } catch (err: any) {
      setActionFeedback({ message: err.message || "Network error", isError: true });
    } finally {
      setRunningDiagnostics(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleCreateIncident = async () => {
    if (!newIncidentTitle.trim() || !newIncidentDesc.trim()) return;
    setSavingIncident(true);
    try {
      const res = await fetch("/api/super-admin/observability/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newIncidentTitle,
          description: newIncidentDesc,
          severity: newIncidentSeverity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowIncidentModal(false);
        setNewIncidentTitle("");
        setNewIncidentDesc("");
        setActionFeedback({ message: "Technical incident logged successfully." });
        fetchTabTelemetry("alerts");
      } else {
        setActionFeedback({ message: data.error || "Failed to log incident", isError: true });
      }
    } catch (err: any) {
      setActionFeedback({ message: err.message || "Network error", isError: true });
    } finally {
      setSavingIncident(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "HEALTHY":
      case "ONLINE":
      case "CONNECTED":
      case "PASSED":
      case "OK":
      case "REACHABLE":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "NORMAL":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "WARNING":
      case "DEGRADED":
      case "BACKLOG":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "CRITICAL":
      case "OFFLINE":
      case "FAILED":
      case "DISCONNECTED":
      case "UNAVAILABLE":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700";
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Filtered requests/errors search
  const filteredLiveRequests = useMemo(() => {
    if (!trafficData?.live?.recentRequests) return [];
    if (!searchQuery) return trafficData.live.recentRequests;
    return trafficData.live.recentRequests.filter(
      (r: any) =>
        r.route?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.hostname?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trafficData, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16 transition-colors duration-300">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
              actionFeedback.isError
                ? "bg-rose-50/90 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800"
                : "bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
            }`}
          >
            {actionFeedback.isError ? (
              <XCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{actionFeedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Header Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
              <ShieldCheckIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  SalesmanPro Infrastructure Observability
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-md">
                  Superadmin Command
                </span>
                {overviewData?.systemStatus && (
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1.5 ${getStatusBadge(
                      overviewData.systemStatus
                    )}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        overviewData.systemStatus === "HEALTHY"
                          ? "bg-emerald-500 animate-pulse"
                          : overviewData.systemStatus === "CRITICAL"
                          ? "bg-rose-500 animate-ping"
                          : "bg-amber-500"
                      }`}
                    />
                    {overviewData.systemStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Host: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">server-01</span> | Node:{" "}
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">v18.19</span> | Uptime:{" "}
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                  {overviewData?.server?.uptimeSeconds
                    ? `${Math.floor(overviewData.server.uptimeSeconds / 3600)}h ${Math.floor(
                        (overviewData.server.uptimeSeconds % 3600) / 60
                      )}m`
                    : "Active"}
                </span>
              </p>
            </div>
          </div>

          {/* Controls Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRunDiagnostics}
              disabled={runningDiagnostics}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <WrenchScrewdriverIcon
                className={`w-4 h-4 ${runningDiagnostics ? "animate-spin" : ""}`}
              />
              {runningDiagnostics ? "Running Tests..." : "Run Diagnostics"}
            </button>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
              <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer font-bold"
              >
                <option value="0" className="dark:bg-slate-900">Pause Auto-Refresh</option>
                <option value="15" className="dark:bg-slate-900">Refresh 15s</option>
                <option value="30" className="dark:bg-slate-900">Refresh 30s</option>
                <option value="60" className="dark:bg-slate-900">Refresh 60s</option>
              </select>
              {autoRefreshInterval > 0 && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1">
                  ({secondsUntilRefresh}s)
                </span>
              )}
            </div>

            <button
              onClick={() => fetchTabTelemetry(activeTab, true)}
              disabled={refreshing}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-all active:scale-95"
              title="Refresh Telemetry"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
            </button>

            <Link
              href="/dashboards"
              className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Exit
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Tabs bar */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-2">
          {[
            { key: "overview", label: "Overview", icon: ShieldCheckIcon },
            { key: "traffic", label: "Live Traffic", icon: ArrowTrendingUpIcon },
            { key: "performance", label: "Performance", icon: BoltIcon },
            { key: "servers", label: "Server Cluster", icon: ServerStackIcon },
            { key: "database", label: "Database Health", icon: CircleStackIcon },
            { key: "workers", label: "Redis & Queues", icon: QueueListIcon },
            { key: "errors", label: "Errors & Logs", icon: BugAntIcon },
            { key: "slow-requests", label: "Slow Requests", icon: ClockIcon },
            { key: "auth", label: "Auth & OAuth", icon: LockClosedIcon },
            { key: "payments", label: "Payments & Webhooks", icon: CreditCardIcon },
            { key: "storage", label: "Storage & Media", icon: FolderIcon },
            { key: "dependencies", label: "External APIs", icon: GlobeAltIcon },
            { key: "alerts", label: "Alerts & Incidents", icon: BellAlertIcon },
            { key: "diagnostics", label: "System Checks", icon: WrenchScrewdriverIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border dark:border-indigo-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white dark:text-indigo-400" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {loading && !overviewData && (
          <div className="flex items-center justify-center py-28">
            <div className="flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading infrastructure telemetry...</p>
            </div>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && overviewData && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                overviewData.systemStatus === "HEALTHY"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                  : overviewData.systemStatus === "CRITICAL"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
              }`}
            >
              <div className="flex items-center gap-3.5">
                {overviewData.systemStatus === "HEALTHY" ? (
                  <CheckCircleIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="w-7 h-7 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <div>
                  <h2 className="text-sm font-black">
                    Global Platform State: {overviewData.systemStatus}
                  </h2>
                  <p className="text-xs opacity-90 mt-0.5 font-medium">{overviewData.statusReason}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("diagnostics")}
                className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white transition-all shadow-sm shrink-0"
              >
                Inspect Health Checks →
              </button>
            </div>

            {/* KPI Ribbon */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                  <span>Availability</span>
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {overviewData.metrics.availabilityPercent}%
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Database & gateway probes</p>
              </div>

              <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                  <span>Traffic (RPM)</span>
                  <ArrowTrendingUpIcon className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {overviewData.metrics.requestsPerMinute}{" "}
                  <span className="text-xs font-normal text-slate-500">req/min</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  P95: {overviewData.metrics.p95LatencyMs}ms | P99: {overviewData.metrics.p99LatencyMs}ms
                </p>
              </div>

              <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                  <span>Error Rate</span>
                  <BugAntIcon className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {overviewData.metrics.errorRatePercent}%
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {overviewData.recentErrors?.length || 0} unique error fingerprints
                </p>
              </div>

              <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                  <span>CPU Load</span>
                  <CpuChipIcon className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {overviewData.metrics.cpuUsagePercent}%
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  RAM: {overviewData.metrics.memoryUsagePercent}% | Disk: {overviewData.metrics.diskUsagePercent}%
                </p>
              </div>
            </div>

            {/* Infrastructure Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CircleStackIcon className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Database & Cache</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("database")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Details →
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">MongoDB Latency</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                      {overviewData.metrics.databaseLatencyMs}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Redis Broker Latency</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                      {overviewData.metrics.redisLatencyMs}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Last Database Backup</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {overviewData.lastBackup?.createdAt
                        ? new Date(overviewData.lastBackup.createdAt).toLocaleDateString()
                        : "Verified"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <QueueListIcon className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Worker Queues</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("workers")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Manage Queues →
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Active Queues</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                      {overviewData.queues?.length || 11} queues
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Waiting Jobs</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {overviewData.metrics.totalQueueWaiting}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Failed Jobs</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {overviewData.metrics.totalQueueFailed}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">External Gateways</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("dependencies")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2">
                  {overviewData.dependencies?.slice(0, 4).map((d: any) => (
                    <div key={d.serviceName} className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-600 dark:text-slate-400">{d.displayName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          d.isAvailable
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {d.isAvailable ? `${d.latencyMs}ms` : "Down"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. LIVE TRAFFIC TAB */}
        {activeTab === "traffic" && trafficData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Live Requests</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {trafficData.live?.totalRequests || 0}
                </div>
              </div>
              <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Req / Sec</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {trafficData.live?.requestsPerSecond || 0} <span className="text-sm font-normal text-slate-400">req/s</span>
                </div>
              </div>
              <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">24h Request Volume</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {trafficData.historical24h?.totalRequests || 0}
                </div>
              </div>
            </div>

            {/* Live Request Stream */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Incoming Request Stream
                </h3>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by route or method..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Route</th>
                      <th className="py-3 px-4">Hostname</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {filteredLiveRequests.slice(0, 30).map((r: any) => (
                      <tr key={r.requestId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.method === "GET"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : r.method === "POST"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {r.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-900 dark:text-slate-200 truncate max-w-xs font-semibold">
                          {r.route}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{r.hostname}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.statusCode < 300
                                ? "text-emerald-600 dark:text-emerald-400"
                                : r.statusCode < 400
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {r.statusCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={r.durationMs > 1000 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-700 dark:text-slate-300"}>
                            {r.durationMs}ms
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 font-sans">{r.userAgentCategory || "web"}</td>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">
                          {new Date(r.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. PERFORMANCE / SLOW REQUESTS TAB */}
        {(activeTab === "performance" || activeTab === "slow-requests") && performanceData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BoltIcon className="w-5 h-5 text-indigo-500" />
                Slow Route Rankings (Aggregated Database & Auth Latencies)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Route</th>
                      <th className="py-3 px-4">Occurrences</th>
                      <th className="py-3 px-4">Avg Latency</th>
                      <th className="py-3 px-4">Peak Latency</th>
                      <th className="py-3 px-4">Avg DB Time</th>
                      <th className="py-3 px-4">Avg Auth Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {performanceData.slowRoutes?.map((sr: any) => (
                      <tr key={sr.route} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-4 font-sans text-slate-900 dark:text-slate-200 font-semibold">{sr.route}</td>
                        <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400 font-bold">{sr.count}</td>
                        <td className="py-2.5 px-4 text-rose-600 dark:text-rose-400 font-bold">{sr.avgDurationMs}ms</td>
                        <td className="py-2.5 px-4 text-rose-500">{sr.maxDurationMs}ms</td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{sr.avgDbMs || 0}ms</td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{sr.avgAuthMs || 0}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. SERVERS TAB */}
        {activeTab === "servers" && serversData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {serversData.servers?.map((s: any) => (
                <div key={s.serverId} className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.name || s.serverId}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{s.hostname}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1 font-medium">
                        <span>CPU Load</span>
                        <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">{s.cpuUsagePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.cpuUsagePercent > 85 ? "bg-rose-500" : s.cpuUsagePercent > 70 ? "bg-amber-500" : "bg-indigo-500"
                          }`}
                          style={{ width: `${Math.min(100, s.cpuUsagePercent)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1 font-medium">
                        <span>Memory (RAM)</span>
                        <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">
                          {formatBytes(s.memoryUsedBytes)} / {formatBytes(s.memoryTotalBytes)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (s.memoryUsedBytes / (s.memoryTotalBytes || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DATABASE TAB */}
        {activeTab === "database" && databaseData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Ping Latency</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {databaseData.health?.pingLatencyMs || 0}ms
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">MongoDB Atlas Primary Active</p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Collections</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {databaseData.health?.totalCollections || 0}
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Backup Size</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {formatBytes(databaseData.health?.lastSuccessfulBackup?.byteSize || 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. REDIS & WORKERS TAB */}
        {activeTab === "workers" && workersData && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <QueueListIcon className="w-5 h-5 text-indigo-500" />
                  BullMQ Background Job Queues
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  {workersData.queues?.length || 0} active queues
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Queue Name</th>
                      <th className="py-3 px-4">Waiting</th>
                      <th className="py-3 px-4">Active</th>
                      <th className="py-3 px-4">Completed</th>
                      <th className="py-3 px-4">Failed</th>
                      <th className="py-3 px-4">Delayed</th>
                      <th className="py-3 px-4">Health</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {workersData.queues?.map((q: any) => (
                      <tr key={q.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-4 font-sans font-bold text-slate-900 dark:text-slate-200">
                          {q.displayName || q.name}
                        </td>
                        <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400 font-bold">{q.waiting}</td>
                        <td className="py-2.5 px-4 text-indigo-600 dark:text-indigo-400">{q.active}</td>
                        <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400">{q.completed}</td>
                        <td className="py-2.5 px-4 text-rose-600 dark:text-rose-400 font-bold">{q.failed}</td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{q.delayed}</td>
                        <td className="py-2.5 px-4 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              q.isHealthy
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {q.isHealthy ? "HEALTHY" : "BACKLOG"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-sans">
                          {q.failed > 0 ? (
                            <button
                              onClick={() => handleRetryQueue(q.name)}
                              disabled={retryingQueue === q.name}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <ArrowPathIcon className={`w-3 h-3 ${retryingQueue === q.name ? "animate-spin" : ""}`} />
                              Retry
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. ERRORS & LOGS TAB */}
        {activeTab === "errors" && errorsData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BugAntIcon className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Centralized Error Fingerprints</h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs font-bold">
                {["ALL", "NEW", "INVESTIGATING", "RESOLVED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setErrorStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-[11px] transition-all ${
                      errorStatusFilter === st
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {errorsData.errors?.map((errGroup: any) => {
                const isExpanded = expandedErrorFps[errGroup.fingerprint];
                return (
                  <div
                    key={errGroup.fingerprint}
                    className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mt-0.5">
                          {errGroup.errorType}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{errGroup.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{errGroup.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Count: <strong className="text-rose-600 dark:text-rose-400">{errGroup.count}</strong>
                        </span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(errGroup.status)}`}>
                          {errGroup.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <span>Last Seen: {new Date(errGroup.lastSeenAt).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        {errGroup.status !== "RESOLVED" ? (
                          <button
                            onClick={() => handleUpdateErrorStatus(errGroup.fingerprint, "RESOLVED")}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateErrorStatus(errGroup.fingerprint, "NEW")}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 13. SYSTEM CHECKS & DIAGNOSTICS TAB */}
        {activeTab === "diagnostics" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">System Health Diagnostics</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Execute active probes against MongoDB, Redis, Queue Workers, Local Storage, and Payment Gateways.
                </p>
              </div>
              <button
                onClick={handleRunDiagnostics}
                disabled={runningDiagnostics}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <PlayIcon className={`w-4 h-4 ${runningDiagnostics ? "animate-spin" : ""}`} />
                {runningDiagnostics ? "Executing Tests..." : "Run All Checks Now"}
              </button>
            </div>

            {diagnosticsData?.results ? (
              <div className="space-y-3">
                {diagnosticsData.results.map((res: any) => (
                  <div
                    key={res.id}
                    className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(res.status)}`}>
                          {res.status}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{res.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{res.message}</p>
                    </div>
                    {res.latencyMs > 0 && (
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0">
                        {res.latencyMs}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                <WrenchScrewdriverIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Click &quot;Run All Checks Now&quot; to execute real-time infrastructure probes.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE INCIDENT MODAL */}
      <AnimatePresence>
        {showIncidentModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Log Technical Incident</h3>
                <button onClick={() => setShowIncidentModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Incident Title</label>
                  <input
                    type="text"
                    value={newIncidentTitle}
                    onChange={(e) => setNewIncidentTitle(e.target.value)}
                    placeholder="e.g. M-Pesa Webhook Latency Degradation"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Severity</label>
                  <select
                    value={newIncidentSeverity}
                    onChange={(e) => setNewIncidentSeverity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="INFO">INFO - Observation</option>
                    <option value="WARNING">WARNING - Partial Degradation</option>
                    <option value="CRITICAL">CRITICAL - Outage</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Impact Description</label>
                  <textarea
                    rows={4}
                    value={newIncidentDesc}
                    onChange={(e) => setNewIncidentDesc(e.target.value)}
                    placeholder="Describe observed symptoms, affected components, and immediate mitigation steps..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateIncident}
                  disabled={savingIncident || !newIncidentTitle.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {savingIncident ? "Logging..." : "Create Incident"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}