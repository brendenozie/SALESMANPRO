"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CreditCardIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  PhoneIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { useWhatsAppOverview } from "@/hooks/useWhatsApp";
import { WhatsAppOverviewResponse } from "@/lib/api/whatsAppClient";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceKes: number;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "pkg_starter", name: "Starter Pack", credits: 10000, priceKes: 500 },
  { id: "pkg_growth", name: "Growth Bundle", credits: 50000, priceKes: 2000, popular: true },
  { id: "pkg_scale", name: "Scale Enterprise", credits: 200000, priceKes: 7000 },
];

interface Props {
  initialOverview?: WhatsAppOverviewResponse;
  companyId: string;
  slug: string;
}

export default function WhatsAppDashboardClient({ initialOverview, companyId, slug }: Props) {
  const [range, setRange] = useState<string>("30d");
  const { data: overview, isLoading, isRefetching, refetch } = useWhatsAppOverview(
    range,
    companyId,
    initialOverview
  );

  // Top-Up Modal State
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(CREDIT_PACKAGES[1]);
  const [paymentPhone, setPaymentPhone] = useState(overview?.connection?.phoneNumber || "");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const connection = overview?.connection;
  const credits = overview?.credits;
  const metrics = overview?.metrics;
  const recentActivity = overview?.recentActivity || [];

  const handleMpesaTopUp = async () => {
    if (!paymentPhone.trim()) {
      toast.error("Please enter an M-Pesa phone number");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await fetch("/api/admin/whatsapp/settings/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          packageId: selectedPackage.id,
          phone: paymentPhone,
          amountKes: selectedPackage.priceKes,
          credits: selectedPackage.credits,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          data.message || `M-Pesa STK Push sent to ${paymentPhone}. Enter your PIN to complete top-up!`
        );
        setIsTopUpModalOpen(false);
      } else {
        toast.error(data.message || "Failed to initiate M-Pesa STK Push. Try again.");
      }
    } catch (err) {
      toast.error("Network error during top-up initiation");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-1.5 w-8 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
                Control Center
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              WhatsApp AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">Concierge Dashboard</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time telemetry, automated commerce actions, and multi-tenant AI credit tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Timeframe selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-bold">
              {[
                { label: "Today", value: "today" },
                { label: "7 Days", value: "7d" },
                { label: "30 Days", value: "30d" },
                { label: "All Time", value: "all" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setRange(t.value)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    range === t.value
                      ? "bg-emerald-500 text-black shadow-sm font-extrabold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-700 dark:text-slate-300 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {/* Quick Navigation Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href={`/admin/${slug}/whatsapp-inbox`}
            className="group p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Live Workspace</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  Live Inbox
                </p>
              </div>
            </div>
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </Link>

          <Link
            href={`/admin/${slug}/whatsapp-conversations`}
            className="group p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 rounded-2xl transition-all shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 text-teal-500 rounded-xl group-hover:scale-110 transition-transform">
                <DocumentTextIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">History & Audits</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-500 transition-colors">
                  Conversations
                </p>
              </div>
            </div>
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
          </Link>

          <Link
            href={`/admin/${slug}/whatsapp-templates`}
            className="group p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-2xl transition-all shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-500 rounded-xl group-hover:scale-110 transition-transform">
                <PaperAirplaneIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Marketing & Outbox</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                  Templates & Broadcasts
                </p>
              </div>
            </div>
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
          </Link>

          <Link
            href={`/admin/${slug}/whatsapp-settings`}
            className="group p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                <Cog6ToothIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Credentials & Persona</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  AI Rules & Settings
                </p>
              </div>
            </div>
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </Link>
        </section>

        {/* Primary Status & Credit Wallet Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connection Status Card */}
          <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${connection?.connected ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp Connection</h3>
                    <p className="text-xs text-slate-500">Meta Cloud API Gateway</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                    connection?.connected
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${connection?.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  {connection?.connected ? "Live & Ready" : "Setup Required"}
                </span>
              </div>

              <div className="space-y-2.5 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">WhatsApp Phone:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {connection?.phoneNumber || "Not Configured"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Display Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {connection?.displayName || "Default Store"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Webhook Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircleIcon className="h-3.5 w-3.5" /> Healthy
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Worker Heartbeat:</span>
                  <span className={`inline-flex items-center gap-1 font-semibold ${connection?.workerStatus === "HEALTHY" ? "text-emerald-500" : "text-amber-500"}`}>
                    <BoltIcon className="h-3.5 w-3.5" /> {connection?.workerStatus || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Model: {connection?.model || "Llama 3.3 70B"}</span>
              <Link
                href={`/admin/${slug}/whatsapp-settings`}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Configure <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* AI Credit Wallet Card (Unified with Company.aiCreditBalance) */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Credit Balance</h3>
                    <p className="text-xs text-slate-400">Centralized Wallet</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-md border border-emerald-500/30">
                  Authoritative
                </span>
              </div>

              <div>
                <p className="text-3xl font-black text-white tracking-tight">
                  {(credits?.balance ?? 0).toLocaleString()}{" "}
                  <span className="text-sm font-semibold text-emerald-400">Credits</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Shared across AI Studio, Product Generation, and WhatsApp Auto-replies.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Credits Consumed</span>
                  <span className="font-bold text-white">{(metrics?.creditsUsed ?? 0).toLocaleString()}</span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Tokens Processed</span>
                  <span className="font-bold text-white">{(metrics?.tokens ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsTopUpModalOpen(true)}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <PlusIcon className="h-4 w-4" /> Top Up AI Credits
            </button>
          </div>

          {/* AI Concierge Automation Status */}
          <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-500/10 text-teal-500 rounded-xl">
                    <BoltIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Automation</h3>
                    <p className="text-xs text-slate-500">Autonomous Concierge</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    connection?.aiEnabled
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                  }`}
                >
                  {connection?.aiEnabled ? "Active" : "Paused"}
                </span>
              </div>

              <div className="space-y-2 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">AI Responses Sent:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{metrics?.aiResponses ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Human Agent Replies:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{metrics?.humanResponses ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pending Escalations:</span>
                  <span className={`font-bold ${(metrics?.escalations ?? 0) > 0 ? "text-amber-500" : "text-slate-900 dark:text-white"}`}>
                    {metrics?.escalations ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Active Conversations:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{metrics?.activeConversations ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Escalation rate: ~{metrics?.inboundMessages ? Math.round(((metrics?.escalations ?? 0) / metrics.inboundMessages) * 100) : 0}%</span>
              <Link
                href={`/admin/${slug}/whatsapp-inbox`}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
              >
                Open Inbox <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Telemetry Metrics Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <span className="text-xs font-medium text-slate-500 block mb-1">Inbound Messages</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {(metrics?.inboundMessages ?? 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              Customer inquiries
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <span className="text-xs font-medium text-slate-500 block mb-1">Outbound Messages</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {(metrics?.outboundMessages ?? 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-1 block">
              AI + Human replies
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <span className="text-xs font-medium text-slate-500 block mb-1">Active Customers</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {(metrics?.activeCustomers ?? 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 block">
              Unique WhatsApp profiles
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <span className="text-xs font-medium text-slate-500 block mb-1">Total AI Invocations</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {(metrics?.aiRequests ?? 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
              Failed: {metrics?.failedAiRequests ?? 0}
            </span>
          </div>
        </section>

        {/* Live Activity Stream */}
        <section className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Recent WhatsApp Activity</h2>
              <p className="text-xs text-slate-500">Live chronological event stream</p>
            </div>
            <Link
              href={`/admin/${slug}/whatsapp-conversations`}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              View Full Logs <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
              No recent WhatsApp messages recorded for this tenant yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
              {recentActivity.map((act) => (
                <div key={act.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                        act.direction === "INBOUND"
                          ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                          : act.senderType === "AI"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                      }`}
                    >
                      {act.direction === "INBOUND" ? "Customer" : act.senderType === "AI" ? "AI Bot" : "Agent"}
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 truncate font-medium">
                      {act.text || "[Media / Interactive Event]"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      {act.status === "SENT" || act.status === "DELIVERED" || act.status === "READ" ? (
                        <span className="text-emerald-500 font-semibold">{act.status}</span>
                      ) : act.status === "FAILED" ? (
                        <span className="text-rose-500 font-semibold">FAILED</span>
                      ) : (
                        act.status
                      )}
                    </span>
                    <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Top-Up Credits Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsTopUpModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <BanknotesIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Refill AI Credit Wallet</h3>
                <p className="text-xs text-slate-500">M-Pesa STK Push Instant Refill</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Credit Package</label>
              <div className="space-y-2">
                {CREDIT_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`w-full p-3 rounded-2xl border text-left flex justify-between items-center transition-all ${
                      selectedPackage.id === pkg.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-extrabold">{pkg.name}</p>
                      <p className="text-xs text-slate-500">{pkg.credits.toLocaleString()} Credits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">KES {pkg.priceKes.toLocaleString()}</p>
                      {pkg.popular && (
                        <span className="text-[10px] text-emerald-400 font-black uppercase">Best Value</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">M-Pesa Phone Number</label>
              <input
                type="text"
                placeholder="07XXXXXXXX or 254XXXXXXXXX"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleMpesaTopUp}
              disabled={isProcessingPayment}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" /> Processing STK Push...
                </>
              ) : (
                <>Pay KES {selectedPackage.priceKes.toLocaleString()} via M-Pesa</>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
