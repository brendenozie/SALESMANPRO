"use client";

import React, { useState, useEffect } from "react";
import {
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function NotificationOpsClient() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"DELIVERIES" | "EVENTS" | "DEVICES" | "BROADCAST">("DELIVERIES");
  const [searchQuery, setSearchQuery] = useState("");
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSeverity, setBroadcastSeverity] = useState<"INFO" | "WARNING" | "CRITICAL">("INFO");
  const [broadcastScope, setBroadcastScope] = useState<"ALL" | "SUPER_ADMINS" | "STORE_ADMINS">("ALL");
  const [broadcastChannels, setBroadcastChannels] = useState<string[]>(["IN_APP", "PUSH_ANDROID", "PUSH_DESKTOP"]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/super-admin/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (err) {
      console.error("Failed to load notification telemetry:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async (attemptId: string) => {
    try {
      setRetryingId(attemptId);
      const res = await fetch("/api/super-admin/notifications/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
      if (res.ok) {
        await fetchTelemetry();
      }
    } catch (err) {
      console.error("Failed to retry delivery:", err);
    } finally {
      setRetryingId(null);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      setBroadcasting(true);
      setBroadcastSuccess(null);
      setBroadcastError(null);

      const res = await fetch("/api/super-admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          severity: broadcastSeverity,
          targetScope: broadcastScope,
          channels: broadcastChannels,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setBroadcastSuccess(`Broadcast published successfully to ${json.recipientCount} recipients!`);
        setBroadcastTitle("");
        setBroadcastMessage("");
        await fetchTelemetry();
      } else {
        setBroadcastError(json.message || "Failed to publish broadcast");
      }
    } catch (err: any) {
      setBroadcastError(err?.message || "Network error");
    } finally {
      setBroadcasting(false);
    }
  };

  const toggleChannel = (ch: string) => {
    setBroadcastChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const stats = data?.stats || {
    totalNotifications: 0,
    totalRecipients: 0,
    totalDevices: 0,
    deliveriesByStatus: {},
    devicesByPlatform: {},
  };

  const deliveredCount = stats.deliveriesByStatus["DELIVERED"] || 0;
  const failedCount = stats.deliveriesByStatus["FAILED"] || 0;
  const queuedCount = stats.deliveriesByStatus["QUEUED"] || 0;
  const totalDeliveries = deliveredCount + failedCount + queuedCount;
  const successRate = totalDeliveries > 0 ? Math.round((deliveredCount / totalDeliveries) * 100) : 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BellAlertIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Notification Command Center</h1>
              <p className="text-sm text-slate-400">
                Ecosystem-wide notification delivery health, channel routing, cross-platform devices, and incident telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("BROADCAST")}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            <span>New Broadcast</span>
          </button>

          <button
            onClick={fetchTelemetry}
            disabled={refreshing}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
            title="Refresh Telemetry"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Published</span>
            <BellAlertIcon className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3 tracking-tight">
            {stats.totalNotifications.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Events across all tenants</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Success Rate</span>
            <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-3 tracking-tight">
            {successRate}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {deliveredCount} delivered / {failedCount} failed
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total User Reached</span>
            <ShieldCheckIcon className="h-5 w-5 text-sky-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3 tracking-tight">
            {stats.totalRecipients.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Isolated recipient entries</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Devices</span>
            <DevicePhoneMobileIcon className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3 tracking-tight">
            {stats.totalDevices}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span>Android: {stats.devicesByPlatform["ANDROID"] || 0}</span>
            <span>Desktop: {stats.devicesByPlatform["WINDOWS_DESKTOP"] || 0}</span>
            <span>Web: {stats.devicesByPlatform["WEB"] || 0}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("DELIVERIES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "DELIVERIES"
              ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          Delivery Monitor ({failedCount > 0 ? `${failedCount} Failed` : "Healthy"})
        </button>
        <button
          onClick={() => setActiveTab("EVENTS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "EVENTS"
              ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          Event Audit Log
        </button>
        <button
          onClick={() => setActiveTab("DEVICES")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "DEVICES"
              ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          Device Registry ({stats.totalDevices})
        </button>
        <button
          onClick={() => setActiveTab("BROADCAST")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "BROADCAST"
              ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          Broadcast Publisher
        </button>
      </div>

      {/* Tab 1: Delivery Monitor */}
      {activeTab === "DELIVERIES" && (
        <div className="space-y-6">
          {/* Failed Deliveries Incident Alert */}
          {failedCount > 0 ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExclamationCircleIcon className="h-6 w-6 text-rose-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Attention: {failedCount} Failed Channel Deliveries Detected</p>
                  <p className="text-xs text-rose-300/80">Review error codes below and trigger automatic retries.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3">
              <CheckCircleIcon className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">All Channels Operational</p>
                <p className="text-xs text-emerald-300/80">Email relay, Android FCM push, and Desktop WebView2 are operating with 100% success.</p>
              </div>
            </div>
          )}

          {/* Failed Deliveries Table */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Failed Deliveries Log</h3>
              <span className="text-xs text-slate-500">Auto-retries capped at 3 attempts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead className="bg-slate-950/60 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Notification</th>
                    <th className="p-3.5">Channel</th>
                    <th className="p-3.5">Destination</th>
                    <th className="p-3.5">Error Message</th>
                    <th className="p-3.5">Attempts</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.failedDeliveries?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        No failed deliveries recorded.
                      </td>
                    </tr>
                  ) : (
                    data?.failedDeliveries?.map((attempt: any) => (
                      <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-white">{attempt.notification?.title || "Notification"}</p>
                          <p className="text-[10px] text-slate-500">{attempt.notification?.eventType}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                            {attempt.channel}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300 text-[11px]">
                          {attempt.destination?.slice(0, 24) || "—"}...
                        </td>
                        <td className="p-3.5 text-rose-400 font-mono text-[11px] max-w-xs truncate">
                          {attempt.error || "Unknown error"}
                        </td>
                        <td className="p-3.5">{attempt.attempts}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleRetry(attempt.id)}
                            disabled={retryingId === attempt.id}
                            className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                          >
                            {retryingId === attempt.id ? "Retrying..." : "Retry Now"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Event Audit Log */}
      {activeTab === "EVENTS" && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-white">Recent Notification Events</h3>
            <div className="relative w-64">
              <MagnifyingGlassIcon className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="bg-slate-950/60 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Title & Message</th>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Recipients</th>
                  <th className="p-3.5">Channels</th>
                  <th className="p-3.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.recentNotifications
                  ?.filter((n: any) =>
                    searchQuery
                      ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        n.eventType?.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                  )
                  .map((item: any) => {
                    const readCount = item.recipients?.filter((r: any) => r.read).length || 0;
                    const totalRecipients = item.recipients?.length || 0;

                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          {item.severity === "CRITICAL" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              CRITICAL
                            </span>
                          ) : item.severity === "WARNING" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              WARNING
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                              INFO
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 max-w-sm">
                          <p className="font-bold text-white truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{item.message}</p>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-300">
                          {item.eventType || "CUSTOM"}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold">{readCount}</span>
                            <span className="text-slate-500">/ {totalRecipients} read</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1">
                            {item.deliveries?.map((d: any) => (
                              <span
                                key={d.id}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  d.status === "DELIVERED"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : d.status === "FAILED"
                                    ? "bg-rose-500/20 text-rose-400"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {d.channel.replace("PUSH_", "")}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Device Registry */}
      {activeTab === "DEVICES" && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Registered Multi-Platform Devices</h3>
            <p className="text-xs text-slate-500">Connected Android devices, Windows Desktop terminals, and Web browsers.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="bg-slate-950/60 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Platform</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Device Name</th>
                  <th className="p-3.5">App Version</th>
                  <th className="p-3.5">Push Token Prefix</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.recentDevices?.map((device: any) => (
                  <tr key={device.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        {device.platform === "ANDROID" ? (
                          <DevicePhoneMobileIcon className="h-4 w-4 text-emerald-400" />
                        ) : device.platform === "WINDOWS_DESKTOP" ? (
                          <ComputerDesktopIcon className="h-4 w-4 text-sky-400" />
                        ) : (
                          <GlobeAltIcon className="h-4 w-4 text-amber-400" />
                        )}
                        <span className="font-bold text-white">{device.platform}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-white">{device.user?.name || "User"}</p>
                      <p className="text-[10px] text-slate-500">{device.user?.email}</p>
                    </td>
                    <td className="p-3.5 text-slate-300">{device.deviceName || "Default"}</td>
                    <td className="p-3.5 font-mono text-[11px]">{device.appVersion || "2.1.0"}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {device.pushToken.slice(0, 16)}...
                    </td>
                    <td className="p-3.5">
                      {device.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-500">
                          REVOKED
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {new Date(device.lastSeenAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Broadcast Publisher */}
      {activeTab === "BROADCAST" && (
        <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 md:p-8 backdrop-blur-xl space-y-6">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Manual Broadcast Dispatcher</h3>
            <p className="text-xs text-slate-400">
              Transmit system-wide alerts, maintenance advisories, or company announcements across In-App, Email, and Push notifications.
            </p>
          </div>

          {broadcastSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
              {broadcastSuccess}
            </div>
          )}

          {broadcastError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">
              {broadcastError}
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Announcement Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Scheduled Maintenance Window Tonight at 23:00 UTC"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Notification Message
              </label>
              <textarea
                required
                rows={3}
                placeholder="Full details regarding the update or alert..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Severity Level
                </label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="INFO">INFO (Normal priority)</option>
                  <option value="WARNING">WARNING (High priority badge)</option>
                  <option value="CRITICAL">CRITICAL (Bypasses quiet hours & audio chime)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Target Audience
                </label>
                <select
                  value={broadcastScope}
                  onChange={(e) => setBroadcastScope(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="ALL">All Active Users (Platform-Wide)</option>
                  <option value="SUPER_ADMINS">Super Administrators Only</option>
                  <option value="STORE_ADMINS">Store Owners & Managers Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Dispatch Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "IN_APP", label: "In-App Notification Center" },
                  { id: "EMAIL", label: "Email Relay (SendGrid/Resend)" },
                  { id: "PUSH_ANDROID", label: "Android Push (FCM)" },
                  { id: "PUSH_DESKTOP", label: "Windows Desktop Toast" },
                ].map((channel) => (
                  <button
                    type="button"
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      broadcastChannels.includes(channel.id)
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {channel.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={broadcasting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              <span>{broadcasting ? "Dispatching Broadcast..." : "Transmit Notification Broadcast"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
