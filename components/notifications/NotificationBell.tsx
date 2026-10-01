"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
  ShoppingBagIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { ClientNotificationBridge } from "@/lib/notifications/clientBridge";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  eventType: string | null;
  actionUrl: string | null;
  resourceType: string | null;
  resourceId: string | null;
  createdAt: string;
  read: boolean;
  readAt: string | null;
  acknowledgedAt: string | null;
}

interface NotificationBellProps {
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
}

export default function NotificationBell({
  className = "",
  buttonClassName = "",
  iconClassName = "w-6 h-6",
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "IMPORTANT">("ALL");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.count === "number") {
          setUnreadCount(data.count);
        }
      }
    } catch {
      // Silently ignore connection blips
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let url = "/api/notifications?limit=25";
      if (filter === "UNREAD") url += "&unreadOnly=true";
      if (filter === "IMPORTANT") url += "&severity=CRITICAL";

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setNotifications(data.data);
          if (typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load & 30s background poll + native device registration
  useEffect(() => {
    ClientNotificationBridge.registerDevice().catch(() => {});
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch items when popover opens or filter changes
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, actionUrl?: string | null) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignore
    }

    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleAcknowledge = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}/acknowledge`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read: true, acknowledgedAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignore
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return "Just now";
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const getEventIcon = (severity: string, eventType: string | null) => {
    if (severity === "CRITICAL") {
      return <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />;
    }
    if (severity === "WARNING") {
      return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />;
    }
    if (eventType?.startsWith("ORDER_") || eventType?.startsWith("PAYMENT_")) {
      return <ShoppingBagIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
    }
    if (eventType?.startsWith("MASCOT_")) {
      return <SparklesIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
    }
    return <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className={`relative p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${buttonClassName}`}
      >
        <BellIcon className={iconClassName} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-red-600 rounded-full border-2 border-white animate-pulse shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden transform transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 font-medium px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-gray-800 transition"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 text-xs font-semibold px-3 py-1.5 space-x-2 bg-white dark:bg-gray-900">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition ${
                filter === "ALL"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={`px-3 py-1 rounded-lg transition ${
                filter === "UNREAD"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter("IMPORTANT")}
              className={`px-3 py-1 rounded-lg transition ${
                filter === "IMPORTANT"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Urgent
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading updates...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircleIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  You have no pending notifications in this view.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.actionUrl)}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors duration-150 ${
                    item.read
                      ? "bg-white hover:bg-gray-50/80 dark:bg-gray-900 dark:hover:bg-gray-800/50"
                      : "bg-orange-50/40 hover:bg-orange-50/70 dark:bg-orange-950/20 dark:hover:bg-orange-950/30"
                  }`}
                >
                  <div className="mt-0.5">{getEventIcon(item.severity, item.eventType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p
                        className={`text-xs font-semibold truncate ${
                          item.read
                            ? "text-gray-800 dark:text-gray-200"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-2 whitespace-nowrap">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {/* Actionable button if action required */}
                    {item.eventType === "MASCOT_APPROVAL_REQUESTED" && !item.acknowledgedAt && (
                      <div className="mt-2 flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => handleAcknowledge(e, item.id)}
                          className="text-[11px] bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1 rounded-md shadow-sm transition"
                        >
                          Review & Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>SalesmanPro Unified Alerting</span>
            <span className="text-[11px] font-medium text-orange-600 dark:text-orange-400">
              Live Sync Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
