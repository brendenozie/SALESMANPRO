"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  MegaphoneIcon,
  SparklesIcon,
  UserGroupIcon,
  EyeIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  TagIcon,
  LinkIcon,
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

type TabType = "BROADCAST" | "INFRASTRUCTURE" | "LOGS";
type CampaignType = "PROMOTIONAL" | "COMMUNICATION";
type TargetAudience = "ALL" | "STORE_ADMINS" | "ROLE" | "CUSTOM";

export default function SuperAdminEmailClient() {
  const [activeTab, setActiveTab] = useState<TabType>("BROADCAST");

  // Overview & Metrics State
  const [metrics, setMetrics] = useState<MetricData>({
    totalSent: 0,
    totalFailed: 0,
    totalQueued: 0,
    totalProcessed: 0,
    successRate: 100,
  });
  const [scopeBreakdown, setScopeBreakdown] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // Test Dispatch State (Infrastructure Tab)
  const [testScope, setTestScope] = useState<"PLATFORM" | "GHUBA">("PLATFORM");
  const [testEmail, setTestEmail] = useState("");
  const [isTestingGateway, setIsTestingGateway] = useState(false);

  // --- Broadcast Composer State ---
  const [campaignType, setCampaignType] = useState<CampaignType>("PROMOTIONAL");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("ALL");
  const [targetRole, setTargetRole] = useState<string>("USER");
  const [customEmails, setCustomEmails] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Message Fields
  const [subject, setSubject] = useState("Exciting new features now live on SalesmanPro!");
  const [headline, setHeadline] = useState("Unlock More Growth with Our Latest Platform Upgrades");
  const [badgeText, setBadgeText] = useState("✨ Special Update");
  const [highlightBox, setHighlightBox] = useState("Limited Time: Experience enhanced AI sales workflows and faster processing.");
  const [bodyText, setBodyText] = useState(
    `Hello {{name}},\n\nWe are thrilled to announce major new enhancements to your SalesmanPro workspace! Our engineering team has rolled out new tools designed to streamline your operations and boost your conversions.\n\nLog in today to explore what's new and take your business to the next level.\n\nThank you for being a key part of our community!`
  );
  const [ctaLabel, setCtaLabel] = useState("Explore New Features");
  const [ctaUrl, setCtaUrl] = useState("https://salesmanpro.site/dashboards");

  // Audience calculation & preview
  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [roleBreakdown, setRoleBreakdown] = useState<Record<string, number>>({});
  const [isLoadingAudience, setIsLoadingAudience] = useState(false);

  // Dispatch & Confirmation Modal State
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // AI Copywriter Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGoal, setAiGoal] = useState("");
  const [aiTone, setAiTone] = useState("Urgent & High-Converting");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // AI Generation Handler
  const handleGenerateAiCopy = async () => {
    if (!aiGoal.trim()) {
      toast.error("Please enter a campaign goal or promotion idea");
      return;
    }

    setIsGeneratingAi(true);
    const toastId = toast.loading("AI is generating high-converting campaign copy...");

    try {
      const res = await fetch("/api/marketing/ai-generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "PLATFORM",
          campaignType,
          goal: aiGoal,
          tone: aiTone,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to generate AI copy");
      }

      const copy = json.data;
      if (copy.subject) setSubject(copy.subject);
      if (copy.headline) setHeadline(copy.headline);
      if (copy.badgeText) setBadgeText(copy.badgeText);
      if (copy.highlightBox) setHighlightBox(copy.highlightBox);
      if (copy.bodyText) setBodyText(copy.bodyText);
      if (copy.ctaLabel) setCtaLabel(copy.ctaLabel);
      if (copy.ctaUrl) setCtaUrl(copy.ctaUrl);

      toast.success("Campaign copy successfully generated by AI!", { id: toastId });
      setShowAiModal(false);
      setAiGoal("");
    } catch (err: any) {
      toast.error(err.message || "AI copy generation failed", { id: toastId });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Fetch overview metrics & logs
  const fetchOverview = async () => {
    setIsLoadingOverview(true);
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
      setIsLoadingOverview(false);
    }
  };

  // Fetch audience breakdown
  const fetchAudience = async () => {
    if (targetAudience === "CUSTOM") {
      const list = customEmails
        .split(/[,\n]+/)
        .map((e) => e.trim())
        .filter((e) => e.includes("@"));
      setMatchingCount(list.length);
      return;
    }

    setIsLoadingAudience(true);
    try {
      const params = new URLSearchParams({
        targetAudience,
        verifiedOnly: String(verifiedOnly),
      });
      if (targetAudience === "ROLE" && targetRole) {
        params.append("targetRole", targetRole);
      }

      const res = await fetch(`/api/super-admin/email/audience?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMatchingCount(json.data.matchingCount);
        setAvailableRoles(json.data.availableRoles || []);
        setRoleBreakdown(json.data.roleBreakdown || {});
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoadingAudience(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchAudience();
  }, [targetAudience, targetRole, verifiedOnly, customEmails]);

  // Handle Preset Selection for Campaign Type
  const handleCampaignTypeChange = (type: CampaignType) => {
    setCampaignType(type);
    if (type === "PROMOTIONAL") {
      setSubject("Exclusive Special Offer & New Updates for You");
      setHeadline("Supercharge Your Sales With SalesmanPro");
      setBadgeText("✨ Special Offer");
      setHighlightBox("Get up to 50 AI Credits free this month on your store workspace.");
      setCtaLabel("Claim Special Offer");
      setCtaUrl("https://salesmanpro.site/dashboards");
    } else {
      setSubject("Important System Notice: Platform Maintenance & Security Updates");
      setHeadline("Scheduled System Maintenance and Performance Enhancements");
      setBadgeText("📢 Official Notice");
      setHighlightBox("Maintenance Window: All systems will remain highly available with minimal background sync interruptions.");
      setCtaLabel("View Status Dashboard");
      setCtaUrl("https://salesmanpro.site/help-center");
    }
  };

  // Send Test Email to Super Admin
  const handleSendTestToSelf = async () => {
    if (!subject.trim() || !bodyText.trim()) {
      toast.error("Please enter a subject and body text first");
      return;
    }

    setIsSendingTest(true);
    const toastId = toast.loading("Sending test broadcast to your email...");

    try {
      const res = await fetch("/api/super-admin/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignType,
          subject,
          headline,
          badgeText,
          highlightText: campaignType === "PROMOTIONAL" ? highlightBox : undefined,
          noticeBox: campaignType === "COMMUNICATION" ? highlightBox : undefined,
          bodyText,
          ctaLabel,
          ctaUrl,
          isTest: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.data?.error || "Failed to deliver test email");
      }

      toast.success(
        `Test email dispatched to ${json.data?.recipient || "your email"}! Check your inbox.`,
        { id: toastId, duration: 5000 }
      );
      fetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch test email", { id: toastId });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Dispatch Broadcast to Target Audience
  const handleExecuteBroadcast = async () => {
    setShowConfirmModal(false);
    setIsSendingBroadcast(true);

    const toastId = toast.loading(
      `Broadcasting ${campaignType.toLowerCase()} email to ${matchingCount ?? "target"} users...`
    );

    try {
      const res = await fetch("/api/super-admin/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignType,
          targetAudience,
          targetRole: targetAudience === "ROLE" ? targetRole : undefined,
          customEmails:
            targetAudience === "CUSTOM"
              ? customEmails.split(/[,\n]+/).map((e) => e.trim()).filter(Boolean)
              : undefined,
          verifiedOnly,
          subject,
          headline,
          badgeText,
          highlightText: campaignType === "PROMOTIONAL" ? highlightBox : undefined,
          noticeBox: campaignType === "COMMUNICATION" ? highlightBox : undefined,
          bodyText,
          ctaLabel,
          ctaUrl,
          isTest: false,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.data?.error || "Broadcast failed");
      }

      const summary = json.data;
      toast.success(
        `🎉 Broadcast completed! Targeted: ${summary.totalTargeted}, Sent: ${summary.totalSent}, Queued: ${summary.totalQueued}`,
        { id: toastId, duration: 6000 }
      );
      fetchOverview();
    } catch (err: any) {
      toast.error(err.message || "Broadcast dispatch encountered an error", { id: toastId });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Gateway Connection Test (Infrastructure Tab)
  const handleGatewayTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Enter a valid test email address");
      return;
    }

    setIsTestingGateway(true);
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
      setIsTestingGateway(false);
    }
  };

  // Live Body Paragraphs for Preview
  const previewParagraphs = useMemo(() => {
    const raw = (bodyText || "").replace(/{{name}}/gi, "John Doe");
    return raw.split(/\n\s*\n/).filter(Boolean);
  }, [bodyText]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] p-4 sm:p-6 lg:p-10 font-sans text-slate-800 dark:text-slate-100">
      <Toaster position="top-right" />

      {/* Header & Controls */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <EnvelopeIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              Super Admin Email & Messaging Center
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                Control Hub
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Broadcast promotional campaigns, send system announcements, and monitor multi-tenant infrastructure
            </p>
          </div>
        </div>

        <button
          onClick={fetchOverview}
          disabled={isLoadingOverview}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200 shadow-sm"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoadingOverview ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-8 border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab("BROADCAST")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === "BROADCAST"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <MegaphoneIcon className="w-5 h-5" />
            <span>Broadcast & Messaging</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold">
              New
            </span>
          </button>

          <button
            onClick={() => setActiveTab("INFRASTRUCTURE")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === "INFRASTRUCTURE"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Infrastructure & Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab("LOGS")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === "LOGS"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <ClockIcon className="w-5 h-5" />
            <span>Delivery Logs</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {logs.length}
            </span>
          </button>
        </nav>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BROADCAST & MESSAGING CENTER                      */}
      {/* ======================================================== */}
      {activeTab === "BROADCAST" && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Quick Notice Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-200 dark:border-orange-900/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-orange-500 shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Authoritative Dispatch: </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Messages are delivered directly through your verified platform Gmail SMTP gateway (
                  <code className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                    tulivuapps@gmail.com
                  </code>
                  ) with full brand layout and responsive mobile rendering.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="shrink-0 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-amber-200" />
                AI Smart Copywriter
              </button>

              <button
                type="button"
                onClick={handleSendTestToSelf}
                disabled={isSendingTest}
                className="shrink-0 px-3.5 py-1.5 text-xs font-bold rounded-xl border border-orange-300 dark:border-orange-800 bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 hover:bg-orange-50 transition-all flex items-center gap-1.5"
              >
                <PaperAirplaneIcon className="w-3.5 h-3.5" />
                {isSendingTest ? "Sending..." : "Test to My Email"}
              </button>
            </div>
          </div>

          {/* Main 2-Column Composer & Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Composer & Audience (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Campaign Type Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  1. Message Category & Intent
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCampaignTypeChange("PROMOTIONAL")}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      campaignType === "PROMOTIONAL"
                        ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 ring-2 ring-orange-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <SparklesIcon className="w-5 h-5 text-orange-500" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Promotional Email
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Product updates, feature releases, special offers, and conversion announcements.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCampaignTypeChange("COMMUNICATION")}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      campaignType === "COMMUNICATION"
                        ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 ring-2 ring-sky-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MegaphoneIcon className="w-5 h-5 text-sky-500" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        System Communication
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Official notices, maintenance alerts, policy changes, and direct administrative news.
                    </p>
                  </button>
                </div>
              </div>

              {/* Audience Targeting Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <UserGroupIcon className="w-4 h-4 text-slate-400" />
                    2. Target Audience Selection
                  </label>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {isLoadingAudience ? (
                      <span>Calculating...</span>
                    ) : (
                      <span>
                        🎯 {matchingCount !== null ? `${matchingCount} recipient${matchingCount === 1 ? "" : "s"}` : "0"} targeted
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Recipient Group
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    >
                      <option value="ALL">All Active Platform Users</option>
                      <option value="STORE_ADMINS">Store Admins & Owners Only</option>
                      <option value="ROLE">Filter by Specific User Role</option>
                      <option value="CUSTOM">Custom Email Address List</option>
                    </select>
                  </div>

                  {targetAudience === "ROLE" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Select Role
                      </label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      >
                        {availableRoles.length > 0 ? (
                          availableRoles.map((role) => (
                            <option key={role} value={role}>
                              {role} ({roleBreakdown[role] || 0} users)
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="AGENT">AGENT</option>
                            <option value="CLIENT">CLIENT</option>
                            <option value="CONSUMER">CONSUMER</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  {targetAudience !== "CUSTOM" && (
                    <div className="flex items-center mt-2 sm:mt-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={verifiedOnly}
                          onChange={(e) => setVerifiedOnly(e.target.checked)}
                          className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 dark:border-slate-700"
                        />
                        Only verified email accounts
                      </label>
                    </div>
                  )}
                </div>

                {targetAudience === "CUSTOM" && (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Recipient Emails (comma or newline separated)
                    </label>
                    <textarea
                      rows={3}
                      value={customEmails}
                      onChange={(e) => setCustomEmails(e.target.value)}
                      placeholder="user1@example.com, user2@example.com, manager@store.com"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Message Content Composer Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    3. Compose Email Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setBodyText((prev) => prev + " {{name}}")}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>+ Insert Tag:</span>
                    <code className="bg-orange-100 dark:bg-orange-950/60 px-1.5 py-0.5 rounded text-[11px]">
                      {"{{name}}"}
                    </code>
                  </button>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Email Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  />
                </div>

                {/* Announcement Headline & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Main Headline / Header
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Large title in the email..."
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <TagIcon className="w-3.5 h-3.5" />
                      Pill Badge Text
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="e.g. ✨ New Feature"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                    />
                  </div>
                </div>

                {/* Highlight Box Callout */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {campaignType === "PROMOTIONAL" ? "Special Highlight Box (Optional)" : "Important Notice Callout (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={highlightBox}
                    onChange={(e) => setHighlightBox(e.target.value)}
                    placeholder="Key takeaway, promo details, or alert summary..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Message Body <span className="text-rose-500">*</span>
                    <span className="text-slate-400 font-normal ml-2">
                      (Supports multiple paragraphs with line breaks)
                    </span>
                  </label>
                  <textarea
                    rows={6}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder="Type your message here. Use double enters for paragraphs..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans leading-relaxed"
                  />
                </div>

                {/* Call To Action Button (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <BoltIcon className="w-3.5 h-3.5" />
                      Action Button Label
                    </label>
                    <input
                      type="text"
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value)}
                      placeholder="e.g. Visit Dashboard"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" />
                      Action Destination URL
                    </label>
                    <input
                      type="url"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://salesmanpro.site/..."
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSendTestToSelf}
                    disabled={isSendingTest || isSendingBroadcast}
                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <PaperAirplaneIcon className="w-4 h-4 text-orange-500" />
                    {isSendingTest ? "Sending Test..." : "Send Test to Me"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isSendingBroadcast || isSendingTest || !matchingCount}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <MegaphoneIcon className="w-4 h-4" />
                    {isSendingBroadcast
                      ? "Dispatching Broadcast..."
                      : `Send Broadcast to ${matchingCount !== null ? matchingCount : ""} User${matchingCount === 1 ? "" : "s"}`}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Live Preview (5 Cols) */}
            <div className="lg:col-span-5 sticky top-6">
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-slate-200">
                {/* Simulated Email Client Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-slate-400 font-semibold text-[11px] ml-1 flex items-center gap-1">
                      <EyeIcon className="w-3.5 h-3.5" />
                      Live Email Preview
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {campaignType}
                  </span>
                </div>

                {/* Email Metadata Simulation */}
                <div className="space-y-1 mb-4 text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="truncate">
                    <span className="text-slate-500">From:</span>{" "}
                    <span className="text-orange-400 font-bold">&quot;SalesmanPro&quot;</span>{" "}
                    <span className="text-slate-400">&lt;tulivuapps@gmail.com&gt;</span>
                  </p>
                  <p className="truncate">
                    <span className="text-slate-500">To:</span>{" "}
                    <span className="text-slate-300">recipient@domain.com</span>
                  </p>
                  <p className="truncate">
                    <span className="text-slate-500">Subject:</span>{" "}
                    <span className="text-white font-semibold">{subject || "No subject specified"}</span>
                  </p>
                </div>

                {/* The Email Canvas Card */}
                <div className="bg-[#f8fafc] text-slate-900 rounded-2xl overflow-hidden shadow-inner max-h-[580px] overflow-y-auto border border-slate-200">
                  {/* SalesmanPro Dark Top Banner */}
                  <div className="bg-[#0f172a] p-4 text-center border-b-2 border-orange-500">
                    <span className="text-lg font-extrabold text-white tracking-tight">SalesmanPro</span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    {/* Badge */}
                    <div className="text-center mb-3">
                      <span
                        className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                          campaignType === "PROMOTIONAL"
                            ? "bg-orange-100 text-orange-700 border border-orange-200"
                            : "bg-sky-100 text-sky-800 border border-sky-200"
                        }`}
                      >
                        {badgeText || (campaignType === "PROMOTIONAL" ? "Special Announcement" : "Official Notice")}
                      </span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-lg font-extrabold text-slate-900 text-center leading-snug mb-2">
                      {headline || "Announcement Headline"}
                    </h2>

                    <p className="text-xs text-slate-500 text-center mb-4">Hello John Doe,</p>

                    {/* Paragraphs */}
                    <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                      {previewParagraphs.length > 0 ? (
                        previewParagraphs.map((para, i) => <p key={i}>{para}</p>)
                      ) : (
                        <p className="text-slate-400 italic">Enter message body above to preview paragraphs...</p>
                      )}
                    </div>

                    {/* Highlight Box */}
                    {highlightBox && (
                      <div
                        className={`mt-4 p-3 rounded-xl border text-xs font-semibold ${
                          campaignType === "PROMOTIONAL"
                            ? "bg-orange-50 text-orange-900 border-orange-200"
                            : "bg-sky-50 text-sky-900 border-sky-200"
                        }`}
                      >
                        {highlightBox}
                      </div>
                    )}

                    {/* Call to Action Button */}
                    {ctaLabel && (
                      <div className="text-center my-6">
                        <span
                          className={`inline-block px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer ${
                            campaignType === "PROMOTIONAL" ? "bg-orange-600" : "bg-slate-900"
                          }`}
                        >
                          {ctaLabel} &rarr;
                        </span>
                      </div>
                    )}

                    {/* Footer disclaimer */}
                    <hr className="border-t border-slate-200 my-4" />
                    <div className="text-[10px] text-slate-400 text-center space-y-1">
                      <p>Sent on behalf of <strong>SalesmanPro</strong></p>
                      <p>Need assistance? Contact support@salesmanpro.site</p>
                      <p>&copy; {new Date().getFullYear()} SalesmanPro. All rights reserved.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INFRASTRUCTURE & DIAGNOSTICS                      */}
      {/* ======================================================== */}
      {activeTab === "INFRASTRUCTURE" && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                Store: {scopeBreakdown.STORE || 0} | Platform: {scopeBreakdown.PLATFORM || 0} | Ghuba:{" "}
                {scopeBreakdown.GHUBA || 0}
              </p>
            </div>
          </div>

          {/* Test Dispatch & Architecture Guarantees */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      onClick={handleGatewayTest}
                      disabled={isTestingGateway}
                      className="px-5 py-2 text-sm font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      {isTestingGateway ? "Sending..." : "Test"}
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
                  <span>
                    <strong>Isolated Branding:</strong> Stores never send with Ghuba sender or vice-versa.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <span>
                    <strong>Credential Privacy:</strong> Store SMTP passwords and API keys are AES-256-GCM encrypted and never exposed in responses.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <span>
                    <strong>SSRF Filter:</strong> Arbitrary internal IP ranges and loopbacks are rejected at configuration time.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: GLOBAL DELIVERY AUDIT TABLE                       */}
      {/* ======================================================== */}
      {activeTab === "LOGS" && (
        <div className="max-w-7xl mx-auto">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Global Delivery Logs</h2>
              <button
                onClick={fetchOverview}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
                Refresh Logs
              </button>
            </div>

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
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{log.recipient}</td>
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
                        <td className="py-3 px-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION MODAL BEFORE BROADCAST BLAST                */}
      {/* ======================================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirm Broadcast Dispatch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please review the campaign parameters before broadcasting.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Campaign Type:</span>
                <span className="font-bold text-slate-900 dark:text-white">{campaignType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Audience Scope:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {targetAudience === "ALL"
                    ? "All Active Users"
                    : targetAudience === "STORE_ADMINS"
                    ? "Store Admins & Owners"
                    : targetAudience === "ROLE"
                    ? `Role: ${targetRole}`
                    : "Custom Email List"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Matching Recipients:</span>
                <span className="font-extrabold text-orange-600 dark:text-orange-400 text-sm">
                  {matchingCount} users
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[240px]">
                  {subject}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This will send live emails to all <strong>{matchingCount}</strong> selected users through the platform&apos;s verified Gmail SMTP connection. We recommend clicking <strong>&quot;Send Test to Me&quot;</strong> first if you haven&apos;t previewed it in your inbox yet.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBroadcast}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/30 transition-all flex items-center gap-1.5"
              >
                <MegaphoneIcon className="w-3.5 h-3.5" />
                Yes, Dispatch Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* AI SMART COPYWRITER MODAL                                */}
      {/* ======================================================== */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                AI Smart Campaign Copywriter
              </h3>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Describe the goal, promotion, or announcement you want to broadcast across the platform. The AI will generate high-converting subjects, headlines, badges, and personalized copy.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campaign Goal / Idea <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                placeholder="e.g. Announce 30% discount on annual subscriptions for store owners, or weekend system maintenance notice..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand Tone
              </label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Urgent & High-Converting">Urgent & High-Converting (Best for sales & discounts)</option>
                <option value="Warm & Inspiring">Warm & Inspiring (Best for community & partners)</option>
                <option value="Professional & Authoritative">Professional & Authoritative (Best for notices & policy)</option>
                <option value="Excited & Exclusive">Excited & Exclusive (Best for major feature launches)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiCopy}
                disabled={isGeneratingAi || !aiGoal.trim()}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-amber-200" />
                {isGeneratingAi ? "Generating Copy..." : "Generate & Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
