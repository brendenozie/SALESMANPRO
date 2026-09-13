"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  EnvelopeIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  MegaphoneIcon,
  UserGroupIcon,
  EyeIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  TagIcon,
  LinkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface StoreCustomerEmailCenterProps {
  companyId: string;
  companyName: string;
  slug: string;
}

type CampaignType = "PROMOTIONAL" | "COMMUNICATION";
type AudienceFilter = "ALL_CUSTOMERS" | "REPEAT_BUYERS" | "RECENT_BUYERS" | "LEADS" | "CUSTOM";

export default function StoreCustomerEmailCenter({
  companyId,
  companyName,
  slug,
}: StoreCustomerEmailCenterProps) {
  // Campaign & Audience State
  const [campaignType, setCampaignType] = useState<CampaignType>("PROMOTIONAL");
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("ALL_CUSTOMERS");
  const [customEmails, setCustomEmails] = useState("");

  // Audience counts
  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [audienceBreakdown, setAudienceBreakdown] = useState<Record<string, number>>({});
  const [isLoadingAudience, setIsLoadingAudience] = useState(false);

  // Content Fields
  const [subject, setSubject] = useState(`Exclusive special offer from ${companyName}!`);
  const [headline, setHeadline] = useState(`Special Perks & New Selections at ${companyName}`);
  const [badgeText, setBadgeText] = useState("✨ Special Offer");
  const [highlightBox, setHighlightBox] = useState("Enjoy special discounts and priority fulfillment on your next purchase.");
  const [bodyText, setBodyText] = useState(
    `Hello {{name}},\n\nThank you for being a valued customer of ${companyName}! We are excited to introduce our latest curated collection and special member offers.\n\nBrowse through our storefront today to find what you need at the best prices.\n\nBest regards,\n${companyName} Team`
  );
  const [ctaLabel, setCtaLabel] = useState("Shop Store Now");
  const [ctaUrl, setCtaUrl] = useState(`https://salesmanpro.site/site/${slug}`);

  // Action states
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // AI Copywriter Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGoal, setAiGoal] = useState("");
  const [aiTone, setAiTone] = useState("Urgent & High-Converting");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Fetch store audience
  const fetchAudience = async () => {
    if (audienceFilter === "CUSTOM") {
      const list = customEmails
        .split(/[,\n]+/)
        .map((e) => e.trim())
        .filter((e) => e.includes("@"));
      setMatchingCount(list.length);
      return;
    }

    setIsLoadingAudience(true);
    try {
      const res = await fetch(
        `/api/admin/marketing/email/audience?companyId=${companyId}&filter=${audienceFilter}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setMatchingCount(json.data.matchingCount);
        setAudienceBreakdown(json.data.breakdown || {});
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoadingAudience(false);
    }
  };

  useEffect(() => {
    fetchAudience();
  }, [companyId, audienceFilter, customEmails]);

  // Campaign type switch presets
  const handleCampaignTypeChange = (type: CampaignType) => {
    setCampaignType(type);
    if (type === "PROMOTIONAL") {
      setSubject(`Exclusive special offer from ${companyName}!`);
      setHeadline(`Special Deals Just For You at ${companyName}`);
      setBadgeText("✨ Special Offer");
      setHighlightBox("Limited Time: Shop our top-rated collections and enjoy member pricing.");
      setCtaLabel("Explore Products");
      setCtaUrl(`https://salesmanpro.site/site/${slug}`);
    } else {
      setSubject(`Important update regarding your orders at ${companyName}`);
      setHeadline(`Customer Service & Delivery Notice`);
      setBadgeText("📢 Store Notice");
      setHighlightBox("Notice: Please check our updated holiday schedule and expedited delivery options.");
      setCtaLabel("View Storefront");
      setCtaUrl(`https://salesmanpro.site/site/${slug}`);
    }
  };

  // AI Copy Generation
  const handleGenerateAiCopy = async () => {
    if (!aiGoal.trim()) {
      toast.error("Please enter a campaign goal or discount idea");
      return;
    }

    setIsGeneratingAi(true);
    const toastId = toast.loading("AI is crafting your high-converting campaign...");

    try {
      const res = await fetch("/api/marketing/ai-generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "STORE",
          companyId,
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
      toast.error(err.message || "AI copywriting failed", { id: toastId });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Send test email to merchant
  const handleSendTest = async () => {
    if (!subject.trim() || !bodyText.trim()) {
      toast.error("Subject and body are required to test");
      return;
    }

    setIsSendingTest(true);
    const toastId = toast.loading("Sending test email with store branding...");

    try {
      const res = await fetch("/api/admin/marketing/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
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
        throw new Error(json.message || json.data?.error || "Failed to send test email");
      }

      toast.success(`Test email sent to ${json.data?.recipient || "your email"}! Check your inbox.`, {
        id: toastId,
        duration: 5000,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to deliver test email", { id: toastId });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Broadcast to store consumers
  const handleExecuteBroadcast = async () => {
    setShowConfirmModal(false);
    setIsSendingBroadcast(true);

    const toastId = toast.loading(`Dispatching store broadcast to ${matchingCount} customers...`);

    try {
      const res = await fetch("/api/admin/marketing/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          campaignType,
          filter: audienceFilter,
          customEmails:
            audienceFilter === "CUSTOM"
              ? customEmails.split(/[,\n]+/).map((e) => e.trim()).filter(Boolean)
              : undefined,
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
        `🎉 Store campaign dispatched! Sent: ${summary.totalSent}, Queued: ${summary.totalQueued}`,
        { id: toastId, duration: 6000 }
      );
    } catch (err: any) {
      toast.error(err.message || "Broadcast dispatch encountered an error", { id: toastId });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const previewParagraphs = useMemo(() => {
    const raw = (bodyText || "").replace(/{{name}}/gi, "Customer");
    return raw.split(/\n\s*\n/).filter(Boolean);
  }, [bodyText]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <EnvelopeIcon className="w-5 h-5 text-indigo-400" />
            Store Customer Email Broadcast Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Engage your shoppers with promotional campaigns, discounts, and store announcements under your own brand identity (<strong>{companyName}</strong>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <SparklesIcon className="w-4 h-4 text-amber-300" />
            AI Smart Copywriter
          </button>

          <button
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1.5"
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5 text-indigo-400" />
            {isSendingTest ? "Sending..." : "Test to My Email"}
          </button>
        </div>
      </div>

      {/* 2-Column Composer & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Composer (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Campaign Intent */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              1. Campaign Intent
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCampaignTypeChange("PROMOTIONAL")}
                className={`p-3.5 rounded-xl border text-left transition ${
                  campaignType === "PROMOTIONAL"
                    ? "border-indigo-500 bg-indigo-600/15 ring-2 ring-indigo-500/20"
                    : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <SparklesIcon className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-xs text-white">Promotional Offer</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Product discounts, new stock arrivals, flash sales, and seasonal promotions.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleCampaignTypeChange("COMMUNICATION")}
                className={`p-3.5 rounded-xl border text-left transition ${
                  campaignType === "COMMUNICATION"
                    ? "border-sky-500 bg-sky-600/15 ring-2 ring-sky-500/20"
                    : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <MegaphoneIcon className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-xs text-white">Store Announcement</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Holiday delivery schedules, store operational updates, and policy notices.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Customer Audience Targeting */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <UserGroupIcon className="w-4 h-4 text-indigo-400" />
                2. Target Customer Segment
              </label>

              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {isLoadingAudience
                  ? "Counting..."
                  : `🎯 ${matchingCount ?? 0} customers match`}
              </span>
            </div>

            <div className="space-y-3">
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value as AudienceFilter)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="ALL_CUSTOMERS">
                  All Store Customers & Shoppers ({audienceBreakdown.all || 0})
                </option>
                <option value="REPEAT_BUYERS">
                  Repeat Customers & Loyal Shoppers ({audienceBreakdown.repeat || 0})
                </option>
                <option value="RECENT_BUYERS">
                  Recent 30-Day Shoppers ({audienceBreakdown.recent || 0})
                </option>
                <option value="LEADS">
                  New Leads & Inquiries ({audienceBreakdown.leads || 0})
                </option>
                <option value="CUSTOM">Custom Customer Email List</option>
              </select>

              {audienceFilter === "CUSTOM" && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Enter customer email addresses (comma or newline separated):
                  </label>
                  <textarea
                    rows={3}
                    value={customEmails}
                    onChange={(e) => setCustomEmails(e.target.value)}
                    placeholder="customer1@gmail.com, customer2@yahoo.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. Campaign Content Composer */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Email Content
              </label>
              <button
                type="button"
                onClick={() => setBodyText((prev) => prev + " {{name}}")}
                className="text-[11px] text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>+ Insert:</span>
                <code className="bg-indigo-950 px-1 py-0.5 rounded text-[10px] text-indigo-300">
                  {"{{name}}"}
                </code>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Subject Line <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line seen in inbox..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Headline Title
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Main large headline..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <TagIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. ✨ Flash Sale"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Special Offer / Notice Callout Box
              </label>
              <input
                type="text"
                value={highlightBox}
                onChange={(e) => setHighlightBox(e.target.value)}
                placeholder="Discount code, promotion terms, or alert notice..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Message Body <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Write your email body here. Double enter creates paragraphs..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <BoltIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Button Text
                </label>
                <input
                  type="text"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="e.g. Shop Collection"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Button Destination URL
                </label>
                <input
                  type="url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest || isSendingBroadcast}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <PaperAirplaneIcon className="w-3.5 h-3.5 text-indigo-400" />
                {isSendingTest ? "Sending..." : "Send Test to Me"}
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={isSendingBroadcast || isSendingTest || !matchingCount}
                className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <MegaphoneIcon className="w-4 h-4" />
                {isSendingBroadcast
                  ? "Broadcasting..."
                  : `Broadcast to ${matchingCount ?? 0} Customers`}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Store-Branded Live Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl text-slate-200">
            {/* Simulation Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400 text-[11px] font-semibold ml-2 flex items-center gap-1">
                  <EyeIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Store-Branded Preview
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono">
                {companyName}
              </span>
            </div>

            {/* Email Metadata */}
            <div className="space-y-1 mb-3 text-xs font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <p className="truncate text-[11px]">
                <span className="text-slate-500">From:</span>{" "}
                <span className="text-indigo-400 font-bold">&quot;{companyName}&quot;</span>
              </p>
              <p className="truncate text-[11px]">
                <span className="text-slate-500">Subject:</span>{" "}
                <span className="text-white font-semibold">{subject || "No subject specified"}</span>
              </p>
            </div>

            {/* Canvas */}
            <div className="bg-[#f8fafc] text-slate-900 rounded-xl overflow-hidden shadow-inner max-h-[520px] overflow-y-auto border border-slate-200">
              {/* Store Header Bar */}
              <div className="bg-[#0f172a] p-3 text-center border-b-2 border-indigo-500">
                <span className="text-base font-extrabold text-white tracking-tight">{companyName}</span>
              </div>

              {/* Body */}
              <div className="p-5">
                {/* Badge */}
                <div className="text-center mb-2.5">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      campaignType === "PROMOTIONAL"
                        ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                        : "bg-sky-100 text-sky-800 border border-sky-200"
                    }`}
                  >
                    {badgeText || "Special Update"}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 text-center leading-snug mb-1">
                  {headline}
                </h3>
                <p className="text-[11px] text-slate-500 text-center mb-3">Hello Customer,</p>

                {/* Paragraphs */}
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  {previewParagraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Highlight box */}
                {highlightBox && (
                  <div
                    className={`mt-3 p-2.5 rounded-xl border text-xs font-semibold ${
                      campaignType === "PROMOTIONAL"
                        ? "bg-indigo-50 text-indigo-900 border-indigo-200"
                        : "bg-sky-50 text-sky-900 border-sky-200"
                    }`}
                  >
                    {highlightBox}
                  </div>
                )}

                {/* CTA */}
                {ctaLabel && (
                  <div className="text-center my-4">
                    <span className="inline-block px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm bg-indigo-600">
                      {ctaLabel} &rarr;
                    </span>
                  </div>
                )}

                <hr className="border-t border-slate-200 my-3" />
                <div className="text-[10px] text-slate-400 text-center space-y-0.5">
                  <p>Sent by <strong>{companyName}</strong> via SalesmanPro</p>
                  <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI COPYWRITER MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-400" />
                AI Smart Campaign Copywriter
              </h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Tell the AI what offer, product, or news you want to share with your customers. The AI will craft the headline, subject options, and personalized message body.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Campaign Goal or Promotion Idea <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                placeholder="e.g. 20% discount on all fresh produce this weekend with coupon FRESH20, or new branch opening..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Brand Tone
              </label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Urgent & High-Converting">Urgent & High-Converting (Best for sales & discounts)</option>
                <option value="Warm & Appreciative">Warm & Appreciative (Best for loyal customers)</option>
                <option value="Professional & Informative">Professional & Informative (Best for notices & updates)</option>
                <option value="Excited & Exclusive">Excited & Exclusive (Best for VIP product launches)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiCopy}
                disabled={isGeneratingAi || !aiGoal.trim()}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                {isGeneratingAi ? "Generating Copy..." : "Generate & Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <ExclamationTriangleIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Customer Broadcast</h3>
                <p className="text-xs text-slate-400">Review recipient details before dispatching.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Store:</span>
                <span className="text-white font-bold">{companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Segment:</span>
                <span className="text-white">{audienceFilter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Recipients:</span>
                <span className="text-indigo-400 font-bold">{matchingCount} customers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="text-slate-200 truncate max-w-[200px]">{subject}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Each customer will receive an email personalized with their name and your store branding.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBroadcast}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                <MegaphoneIcon className="w-3.5 h-3.5" />
                Yes, Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
