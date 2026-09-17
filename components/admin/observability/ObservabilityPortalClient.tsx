"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
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
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(15); // seconds (0 = off)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(15);

  // Telemetry Data Stores
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

  // Error Filter State
  const [errorStatusFilter, setErrorStatusFilter] = useState("ALL");
  const [expandedErrorFps, setExpandedErrorFps] = useState<Record<string, boolean>>({});

  // Action States
  const [actionFeedback, setActionFeedback] = useState<{ message: string; isError?: boolean } | null>(null);
  const [retryingQueue, setRetryingQueue] = useState<string | null>(null);

  // New Incident Modal State
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
        const json = await res.json();
        if (json.success) setOverviewData(json.data);
      } else if (tab === "traffic") {
        const res = await fetch("/api/super-admin/observability/traffic");
        const json = await res.json();
        if (json.success) setTrafficData(json.data);
      } else if (tab === "performance" || tab === "slow-requests") {
        const res = await fetch("/api/super-admin/observability/performance?limit=40");
        const json = await res.json();
        if (json.success) setPerformanceData(json.data);
      } else if (tab === "servers") {
        const res = await fetch("/api/super-admin/observability/servers");
        const json = await res.json();
        if (json.success) setServersData(json.data);
      } else if (tab === "database") {
        const res = await fetch("/api/super-admin/observability/database");
        const json = await res.json();
        if (json.success) setDatabaseData(json.data);
      } else if (tab === "workers") {
        const res = await fetch("/api/super-admin/observability/workers");
        const json = await res.json();
        if (json.success) setWorkersData(json.data);
      } else if (tab === "errors") {
        const res = await fetch(`/api/super-admin/observability/errors?status=${errorStatusFilter}`);
        const json = await res.json();
        if (json.success) setErrorsData(json.data);
      } else if (tab === "auth") {
        const res = await fetch("/api/super-admin/observability/auth");
        const json = await res.json();
        if (json.success) setAuthData(json.data);
      } else if (tab === "payments") {
        const res = await fetch("/api/super-admin/observability/payments");
        const json = await res.json();
        if (json.success) setPaymentsData(json.data);
      } else if (tab === "storage") {
        const res = await fetch("/api/super-admin/observability/storage");
        const json = await res.json();
        if (json.success) setStorageData(json.data);
      } else if (tab === "dependencies") {
        const res = await fetch("/api/super-admin/observability/dependencies");
        const json = await res.json();
        if (json.success) setDependenciesData(json.data);
      } else if (tab === "alerts") {
        const [alertsRes, incidentsRes] = await Promise.all([
          fetch("/api/super-admin/observability/alerts"),
          fetch("/api/super-admin/observability/incidents"),
        ]);
        const aJson = await alertsRes.json();
        const iJson = await incidentsRes.json();
        if (aJson.success) setAlertsData(aJson.data);
        if (iJson.success) setIncidentsData(iJson.data);
      }
    } catch (err: any) {
      console.error("Telemetry fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSecondsUntilRefresh(autoRefreshInterval);
    }
  }, [autoRefreshInterval, errorStatusFilter]);

  // Initial tab load & tab switch trigger
  useEffect(() => {
    fetchTabTelemetry(activeTab);
  }, [activeTab, fetchTabTelemetry]);

  // Auto-refresh countdown timer
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

  // Handle Error Status Updates (Acknowledge / Resolve)
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

  // Handle Queue Failed Job Retry
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
        setActionFeedback({ message: data.message || `Retried jobs for ${queueName}` });
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

  // Handle Run Diagnostics
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
        setActionFeedback({ message: data.error || "Failed to run diagnostics", isError: true });
      }
    } catch (err: any) {
      setActionFeedback({ message: err.message || "Network error", isError: true });
    } finally {
      setRunningDiagnostics(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Handle Create Incident
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

  // Helper status color classes
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "HEALTHY":
      case "ONLINE":
      case "CONNECTED":
      case "PASSED":
      case "OK":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "NORMAL":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "WARNING":
      case "DEGRADED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "CRITICAL":
      case "OFFLINE":
      case "FAILED":
      case "DISCONNECTED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans pb-16">
      {/* TOP NOTIFICATION TOAST */}
      {actionFeedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 animate-fade-in ${
            actionFeedback.isError
              ? "bg-rose-950/90 text-rose-200 border-rose-800/80"
              : "bg-emerald-950/90 text-emerald-200 border-emerald-800/80"
          }`}
        >
          {actionFeedback.isError ? (
            <XCircleIcon className="w-5 h-5 text-rose-400" />
          ) : (
            <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
          )}
          <span className="text-sm font-medium">{actionFeedback.message}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shadow-inner">
              <ShieldCheckIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  SalesmanPro Observability & Performance Portal
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                  Superadmin
                </span>
                {overviewData?.systemStatus && (
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border flex items-center gap-1.5 ${getStatusBadge(
                      overviewData.systemStatus,
                    )}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        overviewData.systemStatus === "HEALTHY"
                          ? "bg-emerald-400 animate-pulse"
                          : overviewData.systemStatus === "CRITICAL"
                          ? "bg-rose-400 animate-ping"
                          : "bg-amber-400"
                      }`}
                    />
                    {overviewData.systemStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Host: <span className="text-slate-300 font-mono">server-01</span> | Node:{" "}
                <span className="text-slate-300 font-mono">v18.19</span> | Uptime:{" "}
                <span className="text-slate-300 font-mono">
                  {overviewData?.server?.uptimeSeconds
                    ? `${Math.floor(overviewData.server.uptimeSeconds / 3600)}h ${Math.floor(
                        (overviewData.server.uptimeSeconds % 3600) / 60,
                      )}m`
                    : "Active"}
                </span>
              </p>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRunDiagnostics}
              disabled={runningDiagnostics}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <WrenchScrewdriverIcon
                className={`w-3.5 h-3.5 ${runningDiagnostics ? "animate-spin" : ""}`}
              />
              {runningDiagnostics ? "Running Tests..." : "Run Diagnostics"}
            </button>

            {/* Auto Refresh Select */}
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300">
              <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="0" className="bg-slate-900">Pause</option>
                <option value="15" className="bg-slate-900">15s</option>
                <option value="30" className="bg-slate-900">30s</option>
                <option value="60" className="bg-slate-900">60s</option>
              </select>
              {autoRefreshInterval > 0 && (
                <span className="text-[10px] text-slate-400 font-mono ml-0.5">
                  ({secondsUntilRefresh}s)
                </span>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchTabTelemetry(activeTab, true)}
              disabled={refreshing}
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg text-slate-300 transition hover:text-white"
              title="Refresh Current View"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>

            <Link
              href="/dashboards"
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-slate-800 rounded-lg hover:bg-slate-800/50 transition"
            >
              Exit Portal
            </Link>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-2">
          {[
            { key: "overview", label: "Overview", icon: ShieldCheckIcon },
            { key: "traffic", label: "Live Traffic", icon: ArrowTrendingUpIcon },
            { key: "performance", label: "Performance", icon: BoltIcon },
            { key: "servers", label: "Server Resources", icon: ServerStackIcon },
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 pt-6">
        {loading && !overviewData && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-slate-400">Loading infrastructure telemetry...</p>
            </div>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && overviewData && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                overviewData.systemStatus === "HEALTHY"
                  ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-200"
                  : overviewData.systemStatus === "CRITICAL"
                  ? "bg-rose-950/40 border-rose-800/60 text-rose-200"
                  : "bg-amber-950/30 border-amber-800/40 text-amber-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {overviewData.systemStatus === "HEALTHY" ? (
                  <CheckCircleIcon className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="w-6 h-6 text-amber-400 shrink-0" />
                )}
                <div>
                  <h2 className="text-sm font-semibold">
                    System State: {overviewData.systemStatus}
                  </h2>
                  <p className="text-xs opacity-90 mt-0.5">{overviewData.statusReason}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("diagnostics")}
                  className="px-3 py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 rounded-lg text-xs font-medium text-white transition"
                >
                  View Health Details
                </button>
              </div>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Platform Availability</span>
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {overviewData.metrics.availabilityPercent}%
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Based on MongoDB & Gateway probes</p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Traffic (RPM)</span>
                  <ArrowTrendingUpIcon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {overviewData.metrics.requestsPerMinute}{" "}
                  <span className="text-xs font-normal text-slate-400">req/min</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  P95: {overviewData.metrics.p95LatencyMs}ms | P99: {overviewData.metrics.p99LatencyMs}ms
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Error Rate</span>
                  <BugAntIcon className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {overviewData.metrics.errorRatePercent}%
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {overviewData.recentErrors.length} unique error fingerprints
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Server Resources</span>
                  <CpuChipIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {overviewData.metrics.cpuUsagePercent}%{" "}
                  <span className="text-xs font-normal text-slate-400">CPU</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  RAM: {overviewData.metrics.memoryUsagePercent}% | Disk: {overviewData.metrics.diskUsagePercent}%
                </p>
              </div>
            </div>

            {/* Infrastructure & Queue Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Database & Redis */}
              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CircleStackIcon className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Database & Broker</h3>
                  </div>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("database");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Details →
                  </Link>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">MongoDB Latency</span>
                    <span className="font-mono font-medium text-slate-200">
                      {overviewData.metrics.databaseLatencyMs}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Redis Broker Ping</span>
                    <span className="font-mono font-medium text-slate-200">
                      {overviewData.metrics.redisLatencyMs}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Last Verified Backup</span>
                    <span className="font-mono text-emerald-400">
                      {overviewData.lastBackup?.createdAt
                        ? new Date(overviewData.lastBackup.createdAt).toLocaleDateString()
                        : "Configured"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Background Queues Summary */}
              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <QueueListIcon className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Background Workers</h3>
                  </div>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("workers");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    View 11 Queues →
                  </Link>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Queues Monitored</span>
                    <span className="font-mono font-medium text-slate-200">
                      {overviewData.queues?.length || 11} queues
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Waiting Jobs</span>
                    <span className="font-mono font-medium text-amber-400">
                      {overviewData.metrics.totalQueueWaiting}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Failed Jobs</span>
                    <span className="font-mono font-medium text-rose-400">
                      {overviewData.metrics.totalQueueFailed}
                    </span>
                  </div>
                </div>
              </div>

              {/* External Services */}
              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">External Gateways</h3>
                  </div>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("dependencies");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Matrix →
                  </Link>
                </div>

                <div className="space-y-2">
                  {overviewData.dependencies?.slice(0, 4).map((d: any) => (
                    <div key={d.serviceName} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{d.displayName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          d.isAvailable
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {d.isAvailable ? `${d.latencyMs}ms` : "Down"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Alerts Table */}
            {overviewData.recentAlerts?.length > 0 && (
              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <BellAlertIcon className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Active Operational Alerts</h3>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {overviewData.recentAlerts.map((a: any) => (
                    <div key={a.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="font-semibold text-slate-200">{a.name}</span>
                        <span className="text-slate-400">- {a.description}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        Triggered {a.lastTriggeredAt ? new Date(a.lastTriggeredAt).toLocaleTimeString() : "Recently"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. LIVE TRAFFIC TAB */}
        {activeTab === "traffic" && trafficData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Total Live Requests</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {trafficData.live?.totalRequests || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Requests Per Second</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {trafficData.live?.requestsPerSecond || 0} req/s
                </div>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">24-Hour Request Volume</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {trafficData.historical24h?.totalRequests || 0}
                </div>
              </div>
            </div>

            {/* Live Requests Feed Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Incoming Request Stream
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {trafficData.live?.recentRequests?.length || 0} buffered
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Method</th>
                      <th className="py-2.5 px-4">Route</th>
                      <th className="py-2.5 px-4">Hostname</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Duration</th>
                      <th className="py-2.5 px-4">Client</th>
                      <th className="py-2.5 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {trafficData.live?.recentRequests?.slice(0, 30).map((r: any) => (
                      <tr key={r.requestId} className="hover:bg-slate-800/30">
                        <td className="py-2 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.method === "GET"
                                ? "bg-blue-500/10 text-blue-400"
                                : r.method === "POST"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {r.method}
                          </span>
                        </td>
                        <td className="py-2 px-4 font-sans text-slate-200 truncate max-w-xs">
                          {r.route}
                        </td>
                        <td className="py-2 px-4 text-slate-400">{r.hostname}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              r.statusCode < 300
                                ? "text-emerald-400"
                                : r.statusCode < 400
                                ? "text-blue-400"
                                : "text-rose-400 font-bold"
                            }`}
                          >
                            {r.statusCode}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={r.durationMs > 1000 ? "text-rose-400 font-bold" : "text-slate-300"}>
                            {r.durationMs}ms
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-400 font-sans">{r.userAgentCategory || "web"}</td>
                        <td className="py-2 px-4 text-slate-500 font-sans">
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

        {/* 3. PERFORMANCE / APM TAB */}
        {(activeTab === "performance" || activeTab === "slow-requests") && performanceData && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BoltIcon className="w-5 h-5 text-indigo-400" />
                Slow Route Rankings (Aggregated Database & Auth Timings)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Route</th>
                      <th className="py-2.5 px-4">Slow Occurrences</th>
                      <th className="py-2.5 px-4">Average Latency</th>
                      <th className="py-2.5 px-4">Peak Latency</th>
                      <th className="py-2.5 px-4">Avg DB Time</th>
                      <th className="py-2.5 px-4">Avg Auth Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {performanceData.slowRoutes?.map((sr: any) => (
                      <tr key={sr.route} className="hover:bg-slate-800/30">
                        <td className="py-2 px-4 font-sans text-slate-200 font-medium">{sr.route}</td>
                        <td className="py-2 px-4 text-amber-400">{sr.count}</td>
                        <td className="py-2 px-4 text-rose-400">{sr.avgDurationMs}ms</td>
                        <td className="py-2 px-4 text-rose-300">{sr.maxDurationMs}ms</td>
                        <td className="py-2 px-4 text-slate-400">{sr.avgDbMs || 0}ms</td>
                        <td className="py-2 px-4 text-slate-400">{sr.avgAuthMs || 0}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Slow Requests Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-amber-400" />
                Slow Request Traces ({performanceData.slowRequests?.length || 0})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Trace ID</th>
                      <th className="py-2.5 px-4">Method & Route</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Total Duration</th>
                      <th className="py-2.5 px-4">Database Time</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {performanceData.slowRequests?.map((r: any) => (
                      <tr key={r.requestId} className="hover:bg-slate-800/30">
                        <td className="py-2 px-4 text-indigo-400 font-medium">{r.requestId}</td>
                        <td className="py-2 px-4 font-sans">
                          <span className="text-slate-400 font-mono mr-1.5">{r.method}</span>
                          <span className="text-slate-200">{r.route}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={r.statusCode >= 400 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                            {r.statusCode}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-rose-400 font-bold">{r.durationMs}ms</td>
                        <td className="py-2 px-4 text-slate-400">{r.dbDurationMs ? `${r.dbDurationMs}ms` : "-"}</td>
                        <td className="py-2 px-4 text-slate-500 font-sans">
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

        {/* 4. SERVER RESOURCES TAB */}
        {activeTab === "servers" && serversData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {serversData.servers?.map((s: any) => (
                <div key={s.serverId} className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-white">{s.name || s.serverId}</h4>
                      <p className="text-xs text-slate-400 font-mono">{s.hostname}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>CPU Load</span>
                        <span className="font-mono text-slate-200">{s.cpuUsagePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.cpuUsagePercent > 85 ? "bg-rose-500" : s.cpuUsagePercent > 70 ? "bg-amber-500" : "bg-indigo-500"
                          }`}
                          style={{ width: `${Math.min(100, s.cpuUsagePercent)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Memory (RAM)</span>
                        <span className="font-mono text-slate-200">
                          {formatBytes(s.memoryUsedBytes)} / {formatBytes(s.memoryTotalBytes)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (s.memoryUsedBytes / (s.memoryTotalBytes || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Disk Usage</span>
                        <span className="font-mono text-slate-200">
                          {formatBytes(s.diskUsedBytes)} / {formatBytes(s.diskTotalBytes)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (s.diskUsedBytes / (s.diskTotalBytes || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex justify-between">
                    <span>Role: {s.role}</span>
                    <span>Processes: {s.pm2ProcessCount || 1}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* PM2 Processes Table */}
            {serversData.localDetails?.pm2Processes && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ServerStackIcon className="w-5 h-5 text-indigo-400" />
                  PM2 Process Cluster Status
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-2.5 px-4">PM ID</th>
                        <th className="py-2.5 px-4">Process Name</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Restarts</th>
                        <th className="py-2.5 px-4">Memory</th>
                        <th className="py-2.5 px-4">CPU</th>
                        <th className="py-2.5 px-4">Uptime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {serversData.localDetails.pm2Processes.map((p: any) => (
                        <tr key={p.name} className="hover:bg-slate-800/30">
                          <td className="py-2 px-4 text-slate-400">{p.pm_id}</td>
                          <td className="py-2 px-4 font-sans text-slate-200 font-semibold">{p.name}</td>
                          <td className="py-2 px-4">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-slate-400">{p.restarts}</td>
                          <td className="py-2 px-4 text-slate-300">{formatBytes(p.memoryBytes)}</td>
                          <td className="py-2 px-4 text-slate-300">{p.cpuPercent}%</td>
                          <td className="py-2 px-4 text-slate-400 font-sans">
                            {Math.floor(p.uptimeSeconds / 3600)}h {Math.floor((p.uptimeSeconds % 3600) / 60)}m
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. DATABASE HEALTH TAB */}
        {activeTab === "database" && databaseData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Connection Latency</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {databaseData.health?.pingLatencyMs || 0}ms
                </div>
                <p className="text-[11px] text-emerald-400 mt-1 font-semibold">MongoDB Atlas / Replica Active</p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Collections Monitored</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {databaseData.health?.totalCollections || 0}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Primary business entities</p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Last Verified Backup</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {databaseData.health?.lastSuccessfulBackup?.createdAt
                    ? new Date(databaseData.health.lastSuccessfulBackup.createdAt).toLocaleDateString()
                    : "Active"}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Size: {formatBytes(databaseData.health?.lastSuccessfulBackup?.byteSize || 0)}
                </p>
              </div>
            </div>

            {/* Collection Entity Counts Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CircleStackIcon className="w-5 h-5 text-indigo-400" />
                Database Entities & Record Volume
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {databaseData.health?.collections?.map((c: any) => (
                  <div key={c.name} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                    <span className="text-[11px] text-slate-400">{c.name}</span>
                    <div className="text-lg font-bold text-white mt-0.5 font-mono">
                      {c.estimatedCount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Backup History */}
            {databaseData.recentBackups?.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                  Recent Automated Database Backups
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 font-mono">
                    <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-sans font-semibold uppercase text-slate-400">
                      <tr>
                        <th className="py-2.5 px-4">Backup ID</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Size</th>
                        <th className="py-2.5 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {databaseData.recentBackups.map((b: any) => (
                        <tr key={b.id} className="hover:bg-slate-800/30">
                          <td className="py-2 px-4 text-indigo-400">{b.id.slice(-8)}</td>
                          <td className="py-2 px-4 text-slate-300 font-sans">{b.backupType}</td>
                          <td className="py-2 px-4">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(b.status)}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-slate-300">{formatBytes(b.backupSizeBytes || 0)}</td>
                          <td className="py-2 px-4 text-slate-400 font-sans">
                            {new Date(b.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. REDIS & WORKERS TAB */}
        {activeTab === "workers" && workersData && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <QueueListIcon className="w-5 h-5 text-indigo-400" />
                  BullMQ Background Job Queues
                </h3>
                <span className="text-xs text-slate-400">
                  {workersData.queues?.length || 0} active queues
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Queue Name</th>
                      <th className="py-2.5 px-4">Waiting</th>
                      <th className="py-2.5 px-4">Active</th>
                      <th className="py-2.5 px-4">Completed</th>
                      <th className="py-2.5 px-4">Failed</th>
                      <th className="py-2.5 px-4">Delayed</th>
                      <th className="py-2.5 px-4">Health</th>
                      <th className="py-2.5 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {workersData.queues?.map((q: any) => (
                      <tr key={q.name} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-200">
                          <div>{q.displayName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{q.name}</div>
                        </td>
                        <td className="py-2.5 px-4 text-amber-400 font-bold">{q.waiting}</td>
                        <td className="py-2.5 px-4 text-indigo-400">{q.active}</td>
                        <td className="py-2.5 px-4 text-emerald-400">{q.completed}</td>
                        <td className="py-2.5 px-4 text-rose-400 font-bold">{q.failed}</td>
                        <td className="py-2.5 px-4 text-slate-400">{q.delayed}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              q.isHealthy
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
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
                              className="px-2 py-1 text-[11px] rounded bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/60 transition flex items-center gap-1"
                            >
                              <ArrowPathIcon className={`w-3 h-3 ${retryingQueue === q.name ? "animate-spin" : ""}`} />
                              Retry Failed
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">-</span>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BugAntIcon className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">Centralized Error Fingerprints</h3>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-1 text-xs">
                {["ALL", "NEW", "INVESTIGATING", "RESOLVED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setErrorStatusFilter(st)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      errorStatusFilter === st
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
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
                    className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 mt-0.5">
                          {errGroup.errorType}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{errGroup.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">{errGroup.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono">
                          Count: <strong className="text-rose-400">{errGroup.count}</strong>
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadge(errGroup.status)}`}>
                          {errGroup.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-4">
                        <span>First: {new Date(errGroup.firstSeenAt).toLocaleString()}</span>
                        <span>Last: {new Date(errGroup.lastSeenAt).toLocaleString()}</span>
                        {errGroup.affectedRoutes?.length > 0 && (
                          <span>Routes: {errGroup.affectedRoutes.join(", ")}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {errGroup.status !== "RESOLVED" ? (
                          <button
                            onClick={() => handleUpdateErrorStatus(errGroup.fingerprint, "RESOLVED")}
                            className="px-2 py-1 text-[11px] rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 transition"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateErrorStatus(errGroup.fingerprint, "NEW")}
                            className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            Reopen
                          </button>
                        )}
                        {errGroup.stack && (
                          <button
                            onClick={() =>
                              setExpandedErrorFps((prev) => ({
                                ...prev,
                                [errGroup.fingerprint]: !prev[errGroup.fingerprint],
                              }))
                            }
                            className="px-2 py-1 text-[11px] rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition flex items-center gap-1"
                          >
                            {isExpanded ? "Hide Stack" : "View Stack"}
                            {isExpanded ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && errGroup.stack && (
                      <pre className="p-3 bg-slate-950 text-rose-300/80 text-[11px] rounded-lg overflow-x-auto font-mono max-h-48 border border-slate-800/80">
                        {errGroup.stack}
                      </pre>
                    )}
                  </div>
                );
              })}

              {errorsData.errors?.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No errors recorded for the selected filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. AUTH & OAUTH TAB */}
        {activeTab === "auth" && authData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Total Registered Users</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {authData.metrics?.totalUsers?.toLocaleString() || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Active Sessions</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {authData.metrics?.activeSessions || 1}
                </div>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Avg Auth Latency</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {authData.metrics?.avgAuthDurationMs || 0}ms
                </div>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Auth Failure Rate</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {authData.metrics?.failureRatePercent || 0}%
                </div>
              </div>
            </div>

            {/* Recent Auth Requests */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <LockClosedIcon className="w-5 h-5 text-indigo-400" />
                Recent Signin & OAuth Telemetry
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-sans font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Request ID</th>
                      <th className="py-2.5 px-4">Route</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Duration</th>
                      <th className="py-2.5 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {authData.recentAuthRequests?.map((r: any) => (
                      <tr key={r.requestId} className="hover:bg-slate-800/30">
                        <td className="py-2 px-4 text-indigo-400">{r.requestId}</td>
                        <td className="py-2 px-4 font-sans text-slate-200">{r.route}</td>
                        <td className="py-2 px-4">
                          <span className={r.statusCode >= 400 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                            {r.statusCode}
                          </span>
                        </td>
                        <td className="py-2 px-4">{r.durationMs}ms</td>
                        <td className="py-2 px-4 text-slate-400 font-sans">
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

        {/* 9. PAYMENTS & WEBHOOKS TAB */}
        {activeTab === "payments" && paymentsData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Total Payments (7d)</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {paymentsData.summary?.totalPayments7d || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Successful (7d)</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {paymentsData.summary?.successfulPayments7d || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Failed (7d)</span>
                <div className="text-2xl font-bold text-rose-400 mt-1">
                  {paymentsData.summary?.failedPayments7d || 0}
                </div>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Webhook Events (7d)</span>
                <div className="text-2xl font-bold text-indigo-400 mt-1">
                  {paymentsData.summary?.webhookEventsTracked || 0}
                </div>
              </div>
            </div>

            {/* Recent Payments Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-indigo-400" />
                Recent Payment Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-sans font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Payment ID</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Method</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paymentsData.recentPayments?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="py-2 px-4 text-indigo-400">{p.id.slice(-8)}</td>
                        <td className="py-2 px-4 text-white font-bold font-sans">${p.amount}</td>
                        <td className="py-2 px-4 font-sans text-slate-300">{p.paymentMethod || "Standard"}</td>
                        <td className="py-2 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-400 font-sans">
                          {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 10. STORAGE & MEDIA TAB */}
        {activeTab === "storage" && storageData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Total Disk Capacity</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {formatBytes(storageData.disk?.usedBytes)} / {formatBytes(storageData.disk?.totalBytes)}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${storageData.disk?.usagePercent || 0}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Catalog Media Assets</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {storageData.media?.totalMediaAssets?.toLocaleString() || 0}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Cloudinary, S3 & local media</p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-400">Backup Archive Storage</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {formatBytes(storageData.backups?.totalStorageBytes || 0)}
                </div>
                <p className="text-[11px] text-emerald-400 mt-1">
                  {storageData.backups?.recentCount || 0} snapshot archives
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 11. EXTERNAL DEPENDENCIES TAB */}
        {activeTab === "dependencies" && dependenciesData && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5 text-indigo-400" />
                External Service Health & Gateway Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {dependenciesData.dependencies?.map((dep: any) => (
                  <div
                    key={dep.serviceName}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{dep.displayName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          dep.isAvailable
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {dep.isAvailable ? "REACHABLE" : "UNAVAILABLE"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Latency: <strong className="text-slate-200">{dep.latencyMs}ms</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Checked: {new Date(dep.lastCheckedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 12. ALERTS & INCIDENTS TAB */}
        {activeTab === "alerts" && alertsData && (
          <div className="space-y-6">
            {/* Top Bar with Add Incident Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellAlertIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Configured Operational Alerts</h3>
              </div>
              <button
                onClick={() => setShowIncidentModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
              >
                + Create Incident
              </button>
            </div>

            {/* Alerts Table */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
                  <tr>
                    <th className="py-2.5 px-4">Alert Name</th>
                    <th className="py-2.5 px-4">Condition</th>
                    <th className="py-2.5 px-4">Severity</th>
                    <th className="py-2.5 px-4">Current State</th>
                    <th className="py-2.5 px-4">Last Triggered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {alertsData.alerts?.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-200">
                        {a.name}
                        <div className="text-[10px] text-slate-500">{a.description}</div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">
                        {a.metric} {a.condition} {a.threshold}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(a.severity)}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(a.state)}`}>
                          {a.state}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 font-sans">
                        {a.lastTriggeredAt ? new Date(a.lastTriggeredAt).toLocaleString() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Incidents Timeline */}
            {incidentsData?.incidents?.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Technical Incidents History</h3>
                <div className="space-y-3">
                  {incidentsData.incidents.map((inc: any) => (
                    <div key={inc.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{inc.title}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadge(inc.status)}`}>
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{inc.description}</p>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Started: {new Date(inc.startedAt).toLocaleString()} | Severity: {inc.severity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 13. SYSTEM CHECKS & DIAGNOSTICS TAB */}
        {activeTab === "diagnostics" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Comprehensive System Health Diagnostics</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deep active probes against MongoDB, Redis, Queue Workers, Local Disk, and External Gateways.
                </p>
              </div>
              <button
                onClick={handleRunDiagnostics}
                disabled={runningDiagnostics}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 shadow"
              >
                <PlayIcon className={`w-4 h-4 ${runningDiagnostics ? "animate-spin" : ""}`} />
                {runningDiagnostics ? "Executing Tests..." : "Run All Checks Now"}
              </button>
            </div>

            {diagnosticsData?.results && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span>
                      Total Tests: <strong>{diagnosticsData.summary.totalTests}</strong>
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Passed: {diagnosticsData.summary.passed}
                    </span>
                    {diagnosticsData.summary.warnings > 0 && (
                      <span className="text-amber-400 font-semibold">
                        Warnings: {diagnosticsData.summary.warnings}
                      </span>
                    )}
                    {diagnosticsData.summary.failed > 0 && (
                      <span className="text-rose-400 font-semibold">
                        Failed: {diagnosticsData.summary.failed}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono">
                    Completed in {diagnosticsData.summary.durationMs}ms
                  </span>
                </div>

                <div className="space-y-2">
                  {diagnosticsData.results.map((res: any) => (
                    <div
                      key={res.id}
                      className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(res.status)}`}>
                            {res.status}
                          </span>
                          <h4 className="text-xs font-semibold text-white">{res.name}</h4>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">[{res.category}]</span>
                        </div>
                        <p className="text-xs text-slate-300">{res.message}</p>
                      </div>
                      {res.latencyMs > 0 && (
                        <span className="text-xs font-mono text-slate-400 shrink-0">
                          {res.latencyMs}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!diagnosticsData && (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-3">
                <WrenchScrewdriverIcon className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm text-slate-300">Click &quot;Run All Checks Now&quot; to execute real-time system diagnostics.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE INCIDENT MODAL */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Log Technical Incident</h3>
              <button onClick={() => setShowIncidentModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Incident Title</label>
                <input
                  type="text"
                  value={newIncidentTitle}
                  onChange={(e) => setNewIncidentTitle(e.target.value)}
                  placeholder="e.g. M-Pesa Webhook Latency Degradation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Severity</label>
                <select
                  value={newIncidentSeverity}
                  onChange={(e) => setNewIncidentSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="INFO">INFO - Minor Observation</option>
                  <option value="WARNING">WARNING - Partial Degradation</option>
                  <option value="CRITICAL">CRITICAL - Outage / Major Impact</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Description & Impact</label>
                <textarea
                  rows={4}
                  value={newIncidentDesc}
                  onChange={(e) => setNewIncidentDesc(e.target.value)}
                  placeholder="Describe observed symptoms, affected components, and immediate mitigation steps..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowIncidentModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIncident}
                disabled={savingIncident || !newIncidentTitle.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition disabled:opacity-50"
              >
                {savingIncident ? "Logging..." : "Create Incident"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
