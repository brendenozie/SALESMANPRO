"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Cog6ToothIcon,
  KeyIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckIcon,
  PhoneIcon,
  CommandLineIcon,
  AdjustmentsHorizontalIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export interface WhatsAppSettings {
  phoneNumberId: string;
  wabaAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  enableAiAgent: boolean;
  aiTone: "professional" | "friendly" | "concise" | "persuasive";
  aiSystemPrompt: string;
  maxAutoRepliesPerUser: number;
  autoHandoffKeywords: string;
  enableBusinessHours: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  offHoursMessage: string;
}

interface Props {
  initialSettings: WhatsAppSettings;
  companyId: string;
}

export default function WhatsAppSettingsClient({
  initialSettings,
  companyId,
}: Props) {
  const [settings, setSettings] = useState<WhatsAppSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"api" | "ai" | "handoff" | "hours">("api");

  const handleChange = (
    field: keyof WhatsAppSettings,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/whatsapp/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, companyId }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success("WhatsApp configuration saved successfully!");
      } else {
        toast.error(result.message || "Failed to update settings");
      }
    } catch (error) {
      toast.error("Network error while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-6 md:p-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                System Control
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              WhatsApp <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Automation & Rules.</span>
            </h1>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <CheckIcon className="h-4 w-4 stroke-[3]" />
            )}
            Save Configuration
          </button>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto">
          {[
            { id: "api", label: "Meta Cloud API", icon: KeyIcon },
            { id: "ai", label: "AI Engine Prompting", icon: SparklesIcon },
            { id: "handoff", label: "Handoff & Trigger Rules", icon: ShieldCheckIcon },
            { id: "hours", label: "Business Hours & Alerts", icon: ClockIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400 shadow-md"
                    : "bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* TAB 1: Meta Cloud API Settings */}
          {activeTab === "api" && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyIcon className="h-5 w-5 text-emerald-500" /> Meta WhatsApp Business Credentials
                </h3>
                <p className="text-xs text-slate-500">
                  Configure your official Meta Cloud API endpoints to handle inbound and outbound messaging.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Phone Number ID
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 109283746501928"
                      value={settings.phoneNumberId}
                      onChange={(e) => handleChange("phoneNumberId", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    WhatsApp Business Account (WABA) ID
                  </label>
                  <div className="relative">
                    <CommandLineIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 987654321012345"
                      value={settings.wabaAccountId}
                      onChange={(e) => handleChange("wabaAccountId", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Permanent System Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="EAAG..."
                    value={settings.accessToken}
                    onChange={(e) => handleChange("accessToken", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Webhook Verification Token
                  </label>
                  <input
                    type="text"
                    placeholder="custom_secret_verify_token"
                    value={settings.webhookVerifyToken}
                    onChange={(e) => handleChange("webhookVerifyToken", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI Bot Prompting & Tone */}
          {activeTab === "ai" && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-emerald-500" /> Autonomous AI Assistant
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define how your automated assistant interacts with customers over WhatsApp.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {settings.enableAiAgent ? "AI Active" : "AI Paused"}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.enableAiAgent}
                    onChange={(e) => handleChange("enableAiAgent", e.target.checked)}
                    className="h-5 w-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    AI Response Persona / Tone
                  </label>
                  <select
                    value={settings.aiTone}
                    onChange={(e) => handleChange("aiTone", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="professional">Professional & Authoritative</option>
                    <option value="friendly">Friendly & Conversational</option>
                    <option value="concise">Concise & Direct (Brief answers)</option>
                    <option value="persuasive">Sales & Conversion Focused</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Max Consecutive AI Messages Per User Session
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={settings.maxAutoRepliesPerUser}
                    onChange={(e) =>
                      handleChange("maxAutoRepliesPerUser", parseInt(e.target.value))
                    }
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                    <CommandLineIcon className="h-3.5 w-3.5 text-slate-400" />
                    System Prompt Instructions & Knowledge Context
                  </label>
                  <textarea
                    rows={6}
                    placeholder="You are an AI sales assistant for our company. Help users pick products, check stock, and place orders..."
                    value={settings.aiSystemPrompt}
                    onChange={(e) => handleChange("aiSystemPrompt", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Handoff & Safety Triggers */}
          {activeTab === "handoff" && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-500" /> Human Escalation Triggers
                </h3>
                <p className="text-xs text-slate-500">
                  Automatically pass chat sessions from the AI to a human support agent when specific phrases are spoken.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Auto-Handoff Keywords (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="agent, talk to human, manager, refund, call me, representative"
                    value={settings.autoHandoffKeywords}
                    onChange={(e) => handleChange("autoHandoffKeywords", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-amber-600 dark:text-amber-400 text-xs">
                  <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>
                    When any of these keywords are matched in a customer message, the system will immediately disable the AI agent for that conversation and tag it as <strong>"PENDING_HANDOFF"</strong> in your Live Inbox.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Business Hours */}
          {activeTab === "hours" && (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-emerald-500" /> Automated Schedule & Off-Hours
                  </h3>
                  <p className="text-xs text-slate-500">
                    Send automated responses outside regular operating hours.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {settings.enableBusinessHours ? "Hours Active" : "24/7 Enabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.enableBusinessHours}
                    onChange={(e) => handleChange("enableBusinessHours", e.target.checked)}
                    className="h-5 w-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {settings.enableBusinessHours && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={settings.businessHoursStart}
                      onChange={(e) => handleChange("businessHoursStart", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={settings.businessHoursEnd}
                      onChange={(e) => handleChange("businessHoursEnd", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                      <ChatBubbleBottomCenterTextIcon className="h-3.5 w-3.5 text-slate-400" />
                      After-Hours Automatic Message
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Thanks for messaging us! Our office is currently closed. We will reply first thing in the morning."
                      value={settings.offHoursMessage}
                      onChange={(e) => handleChange("offHoursMessage", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}