"use client";

/**
 * app/admin/[slug]/settings/ai-mascot/MascotSettingsClient.tsx
 *
 * Dedicated Admin Control Center for SalesmanPro AI Mascot.
 * Empowers store administrators to toggle features, configure appearance/voice,
 * set role-based capability boundaries, and customize approval policies.
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { MascotAvatar } from "@/components/ai/mascot/MascotAvatar";
import { MascotSettings, MascotModule } from "@/lib/ai/mascot/types";
import { DEFAULT_MASCOT_SETTINGS } from "@/lib/ai/mascot/settingsService";

interface Props {
  companyId: string;
  storeSlug: string;
  storeCategory: string;
}

export default function MascotSettingsClient({ companyId, storeSlug, storeCategory }: Props) {
  const [settings, setSettings] = useState<MascotSettings>(DEFAULT_MASCOT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live test preview state for MascotAvatar in settings
  const [previewState, setPreviewState] = useState<any>("idle");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/ai/mascot/settings?companyId=${companyId}`);
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to fetch mascot settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [companyId]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/ai/mascot/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, settings }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: "success", text: "Mascot configuration saved successfully!" });
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to save settings." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Network error while saving." });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleModuleToggle = (moduleKey: MascotModule) => {
    setSettings((prev) => ({
      ...prev,
      moduleToggles: {
        ...prev.moduleToggles,
        [moduleKey]: !prev.moduleToggles[moduleKey],
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-500">
        <ArrowPathIcon className="w-6 h-6 animate-spin mr-2" />
        <span>Loading Mascot Configuration...</span>
      </div>
    );
  }

  const modulesList: Array<{ key: MascotModule; label: string; desc: string }> = [
    { key: "products", label: "Products & Catalog", desc: "Search, creation, and editing of store catalog items" },
    { key: "inventory", label: "Inventory & Stock", desc: "Stock audit, low-stock alerts, and restocking adjustments" },
    { key: "pricing", label: "Pricing & Discounts", desc: "Individual price updates and bulk category discount adjustments" },
    { key: "orders", label: "Orders & Fulfillment", desc: "Customer order tracking, fulfillment status, and POS lookups" },
    { key: "finance", label: "Finance & Reports", desc: "Revenue summaries, P&L explanations, and invoice drafting" },
    { key: "messaging", label: "Messaging & WhatsApp", desc: "Drafting and dispatching WhatsApp & email communications" },
    { key: "marketing", label: "Marketing & Social", desc: "Ad campaign planning, social captions, and audience strategies" },
    { key: "marketplace", label: "Ghuba Marketplace", desc: "Syncing and publishing catalog products to Ghuba" },
    { key: "education", label: "School & Students", desc: "Student grading, term report cards, and parent notifications" },
    { key: "staff", label: "Staff Operations", desc: "Roster check, shift attendance, and staff performance review" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              SalesmanPro AI Mascot Settings
            </h1>
            <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Role-Aware Assistant
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Configure permissions, animated character appearance, voice output, and approval rules for your store.
          </p>
        </div>

        {/* Global Enable / Disable Toggle */}
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Mascot Status:
          </span>
          <button
            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-xs font-extrabold ${settings.enabled ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
            {settings.enabled ? "ACTIVE" : "DISABLED"}
          </span>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-2 text-sm font-semibold ${
            statusMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {statusMsg.type === "success" ? <CheckCircleIcon className="w-5 h-5 shrink-0" /> : <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Grid: Appearance & Voice + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Appearance & Voice Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Appearance & Animation */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
              <PaintBrushIcon className="w-5 h-5 text-indigo-500" />
              <span>Character & Appearance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Character Personality
                </label>
                <select
                  value={settings.character}
                  onChange={(e) => setSettings({ ...settings, character: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="alex">Alex (Executive & Professional)</option>
                  <option value="byte">Byte (Fast Commerce Specialist)</option>
                  <option value="nova">Nova (Futuristic Intelligence)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Animation Level
                </label>
                <select
                  value={settings.animationLevel}
                  onChange={(e) => setSettings({ ...settings, animationLevel: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="dynamic">Dynamic (Full Micro-Animations)</option>
                  <option value="subtle">Subtle (Smooth Low Overhead)</option>
                  <option value="disabled">Disabled (Static Icon Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Widget Size
                </label>
                <select
                  value={settings.size}
                  onChange={(e) => setSettings({ ...settings, size: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="normal">Standard (Balanced)</option>
                  <option value="compact">Compact (Minimalist)</option>
                  <option value="large">Prominent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Screen Dock Position
                </label>
                <select
                  value={settings.defaultPosition}
                  onChange={(e) => setSettings({ ...settings, defaultPosition: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="bottom-right">Bottom Right (Default)</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Voice & Speech Synthesis */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
              <SpeakerWaveIcon className="w-5 h-5 text-sky-500" />
              <span>Voice Interaction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Voice Persona Tone
                </label>
                <select
                  value={settings.voiceType}
                  onChange={(e) => setSettings({ ...settings, voiceType: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value="friendly">Friendly & Helpful</option>
                  <option value="professional">Corporate Professional</option>
                  <option value="executive">Executive Concise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Speech Cadence Speed
                </label>
                <select
                  value={settings.voiceSpeed}
                  onChange={(e) => setSettings({ ...settings, voiceSpeed: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <option value={0.9}>0.9x (Deliberate)</option>
                  <option value={1.0}>1.0x (Natural Normal)</option>
                  <option value={1.15}>1.15x (Brisk Operational)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Avatar Test Playground */}
        <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center justify-between text-center">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400">
              Interactive Character Preview
            </span>
            <h3 className="font-bold text-lg text-white mt-1">
              {settings.character === "alex" ? "Alex" : settings.character === "byte" ? "Byte" : "Nova"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Test how the mascot visually responds to different operational states.
            </p>
          </div>

          <div className="my-8 flex items-center justify-center p-6 bg-slate-950/70 rounded-3xl border border-slate-800 shadow-inner">
            <MascotAvatar state={previewState} size="lg" />
          </div>

          {/* Test Buttons */}
          <div className="w-full space-y-2">
            <div className="text-[11px] font-semibold text-slate-400">Test Expression:</div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {(["idle", "listening", "thinking", "processing", "success", "needs_approval"] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setPreviewState(st)}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition-colors capitalize ${
                      previewState === st
                        ? "bg-indigo-600 text-white border-indigo-500 shadow"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Module Permissions Matrix */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-500" />
            <span>Store Module Capabilities</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Toggle which business functions the mascot is permitted to assist with for this store.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modulesList.map((m) => {
            const isEnabled = settings.moduleToggles[m.key] !== false;
            return (
              <div
                key={m.key}
                onClick={() => handleModuleToggle(m.key)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                  isEnabled
                    ? "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    : "bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                }`}
              >
                <div className="pr-3">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {m.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {m.desc}
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                    isEnabled
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {isEnabled && <CheckCircleIcon className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4" />
              <span>Save Mascot Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
