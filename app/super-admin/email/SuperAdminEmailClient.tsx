"use client";

import React, { useState, useEffect } from "react";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

interface MetricData {
  totalSent: number;
  totalFailed: number;
  totalQueued: number;
  totalProcessed: number;
  successRate: number;
}

interface LogEntry {
  id: string;
  scope: string;
  companyId?: string | null;
  companyName?: string | null;
  recipient: string;
  template: string;
  provider: string;
  fromAddress: string;
  status: string;
  providerMessageId?: string | null;
  error?: string | null;
  attempts: number;
  createdAt: string;
  sentAt?: string | null;
}

export default function SuperAdminEmailClient() {
  const [metrics, setMetrics] = useState<MetricData>({
    totalSent: 0,
    totalFailed: 0,
    totalQueued: 0,
    totalProcessed: 0,
    successRate: 100,
  });
  const [scopeBreakdown, setScopeBreakdown] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Test Dispatch State
  const [testScope, setTestScope] = useState<"PLATFORM" | "GHUBA">("PLATFORM");
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/super-admin/email/overview");
      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(json.data.metrics);
        setScopeBreakdown(json.data.scopeBreakdown || {});
        setLogs(json.data.recentLogs || []);
      }
    } catch {
      toast.error("Failed to load platform email metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleTestDispatch = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Enter a valid test email address");
      return;
    }

    setIsTesting(true);
    const toastId = toast.loading(`Dispatching ${testScope} test email to ${testEmail}...`);

    try {
      const res = await fetch("/api/super-admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantType: testScope,
          toEmail: testEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.data?.error || "Dispatch failed");
      }

      toast.success(`${testScope} test email delivered successfully!`, { id: toastId });
      fetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch test email", { id: toastId });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] p-6 lg:p-10 font-sans text-slate-800 dark:text-slate-100">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <EnvelopeIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Platform Email Infrastructure
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Observability, multi-tenant dispatch tracking, and provider controls for SalesmanPro & Ghuba
            </p>
          </div>
        </div>

        <button
          onClick={fetchOverview}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Delivered Emails</span>
            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.totalSent}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
            {metrics.successRate}% Success Rate
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Failed Deliveries</span>
            <XCircleIcon className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.totalFailed}</p>
          <p className="text-xs text-rose-500 mt-2 font-medium">Automatic retries enabled via BullMQ</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Queued in BullMQ</span>
            <ClockIcon className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.totalQueued}</p>
          <p className="text-xs text-slate-400 mt-2">Active queue: email-delivery</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Tenant Volume</span>
            <ChartBarIcon className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.totalProcessed}</p>
          <p className="text-xs text-slate-400 mt-2">
            Store: {scopeBreakdown.STORE || 0} | Platform: {scopeBreakdown.PLATFORM || 0} | Ghuba: {scopeBreakdown.GHUBA || 0}
          </p>
        </div>
      </div>

      {/* Control Panel: Test Dispatch & Architecture Guarantees */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5 text-orange-500" />
            Platform & Marketplace Identity Test Dispatch
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Verify that SalesmanPro and Ghuba deliver emails using their respective distinct identities and branding.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Identity Scope
              </label>
              <select
                value={testScope}
                onChange={(e) => setTestScope(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="PLATFORM">SalesmanPro (Platform)</option>
                <option value="GHUBA">Ghuba (Marketplace)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Recipient Email
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@salesmanpro.site"
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleTestDispatch}
                  disabled={isTesting}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {isTesting ? "Sending..." : "Test"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
            Security & Identity Policy
          </h3>
          <ul className="text-xs space-y-2.5 text-slate-500 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <span><strong>Isolated Branding:</strong> Stores never send with Ghuba sender or vice-versa.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <span><strong>Credential Privacy:</strong> Store SMTP passwords and API keys are AES-256-GCM encrypted and never exposed in responses.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <span><strong>SSRF Filter:</strong> Arbitrary internal IP ranges and loopbacks are rejected at configuration time.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Global Delivery Audit Table */}
      <div className="max-w-7xl mx-auto">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Recent Global Delivery Logs
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              <thead>
                <tr className="text-left font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Identity / Scope</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No delivery logs recorded yet
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {log.recipient}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            log.scope === "PLATFORM"
                              ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300"
                              : log.scope === "GHUBA"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          }`}
                        >
                          {log.scope}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {log.companyName || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {log.template}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{log.provider}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            log.status === "SENT"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : log.status === "FAILED"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
