"use client";

import React, { useState, useEffect } from "react";
import {
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ClockIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface StoreNotificationsClientProps {
  company: {
    id: string;
    name: string;
    slug?: string;
  };
}

export default function StoreNotificationsClient({ company }: StoreNotificationsClientProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "CRITICAL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState<string | null>(null);

  const fetchStoreNotifications = async () => {
    try {
      setRefreshing(true);
      let url = "/api/notifications?limit=50";
      if (filter === "UNREAD") url += "&unreadOnly=true";
      if (filter === "CRITICAL") url += "&severity=CRITICAL";

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setNotifications(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to load store notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStoreNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id: string, actionUrl?: string | null) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Ignore
    }
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/acknowledge`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, acknowledgedAt: new Date().toISOString(), read: true } : n
        )
      );
    } catch {
      // Ignore
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMessage) return;

    try {
      setSendingAnnouncement(true);
      setAnnouncementSuccess(null);

      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMessage,
          eventType: "STORE_ANNOUNCEMENT",
          severity: "INFO",
          companyId: company.id,
          recipientPolicy: { type: "COMPANY_ADMINS" },
          channels: ["IN_APP", "PUSH_ANDROID", "PUSH_DESKTOP"],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAnnouncementSuccess("Store announcement transmitted to all active staff!");
        setAnnouncementTitle("");
        setAnnouncementMessage("");
        await fetchStoreNotifications();
      }
    } catch (err) {
      console.error("Failed to transmit store announcement:", err);
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.message?.toLowerCase().includes(q) ||
      n.eventType?.toLowerCase().includes(q)
    );
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalCount = notifications.filter((n) => n.severity === "CRITICAL" && !n.acknowledgedAt).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <BellAlertIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Store Notification Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Operational notifications, low stock warnings, and staff announcements for {company.name}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStoreNotifications}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Total Notifications
            </span>
            <BellAlertIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
            {notifications.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">In your store inbox</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Unread Items
            </span>
            <ClockIcon className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {unreadCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Awaiting review</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Urgent / Unacknowledged
            </span>
            <ExclamationCircleIcon className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {criticalCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Requires supervisor action</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Notification List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === "ALL"
                    ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("UNREAD")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === "UNREAD"
                    ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("CRITICAL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === "CRITICAL"
                    ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Urgent ({criticalCount})
              </button>
            </div>

            <div className="relative w-full sm:w-60">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* List items */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800/80 rounded-2xl">
                <BellAlertIcon className="h-10 w-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-600 dark:text-slate-400">No notifications found</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  You are completely caught up with store operations.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isCritical = notif.severity === "CRITICAL";
                const isWarning = notif.severity === "WARNING";

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      !notif.read
                        ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20"
                        : "bg-white dark:bg-slate-900/60 border-gray-200 dark:border-slate-800/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                            isCritical
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : isWarning
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-sky-500/10 text-sky-500 border border-sky-500/20"
                          }`}
                        >
                          {notif.eventType?.includes("ORDER") ? (
                            <ShoppingBagIcon className="h-5 w-5" />
                          ) : notif.eventType?.includes("MASCOT") ? (
                            <SparklesIcon className="h-5 w-5" />
                          ) : isCritical ? (
                            <ExclamationCircleIcon className="h-5 w-5" />
                          ) : isWarning ? (
                            <ExclamationTriangleIcon className="h-5 w-5" />
                          ) : (
                            <BellAlertIcon className="h-5 w-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-slate-500 mt-2">
                            <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            <span>•</span>
                            <span className="font-mono">{notif.eventType}</span>
                            {notif.acknowledgedAt && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-500 font-bold flex items-center gap-1">
                                  <CheckIcon className="h-3 w-3" /> Acknowledged
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCritical && !notif.acknowledgedAt && (
                          <button
                            onClick={() => handleAcknowledge(notif.id)}
                            className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        )}
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id, notif.actionUrl)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Mark as Read"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                        {notif.actionUrl && (
                          <a
                            href={notif.actionUrl}
                            className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Store Announcement Form */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                Transmit Store Briefing
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Instantly notify store managers, cashiers, and supervisors across POS terminals and mobile apps.
              </p>
            </div>

            {announcementSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {announcementSuccess}
              </div>
            )}

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Shift Handover Briefing / Promotion Notice"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Message Details
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Key instructions or notes for store staff..."
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={sendingAnnouncement}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>{sendingAnnouncement ? "Transmitting..." : "Send Staff Announcement"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
