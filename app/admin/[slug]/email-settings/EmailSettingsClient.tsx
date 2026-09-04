"use client";

import React, { useState, useEffect } from "react";
import {
  EnvelopeIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { EmailConfigDTO, EmailDeliveryLogDTO, EmailProviderType } from "@/lib/email/types";

interface Props {
  slug: string;
  companyId: string;
  companyName: string;
  initialSettings: EmailConfigDTO;
}

export default function EmailSettingsClient({
  slug,
  companyId,
  companyName,
  initialSettings,
}: Props) {
  const [settings, setSettings] = useState<EmailConfigDTO>(initialSettings);
  const [provider, setProvider] = useState<EmailProviderType>(initialSettings.provider || "SMTP");
  const [passwordInput, setPasswordInput] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);

  // Delivery Logs
  const [logs, setLogs] = useState<EmailDeliveryLogDTO[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/email/logs?companyId=${encodeURIComponent(companyId)}`);
      const data = await res.json();
      if (data.success && data.data?.logs) {
        setLogs(data.data.logs);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [companyId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving email configuration...");

    try {
      const payload: any = {
        companyId,
        provider,
        fromName: settings.fromName,
        fromEmail: settings.fromEmail,
        replyTo: settings.replyTo,
        enabled: settings.enabled,
      };

      if (provider === "SMTP") {
        payload.host = settings.host;
        payload.port = settings.port;
        payload.secure = settings.secure;
        payload.username = settings.username;
        if (passwordInput) {
          payload.password = passwordInput;
        }
      } else {
        if (apiKeyInput) {
          payload.apiKey = apiKeyInput;
        }
        payload.hasApiKey = settings.hasApiKey;
      }

      const res = await fetch("/api/admin/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save configuration");
      }

      toast.success("Email configuration updated successfully!", { id: toastId });
      setPasswordInput("");
      setApiKeyInput("");
      setSettings((prev) => ({
        ...prev,
        ...data.data,
        hasPassword: Boolean(passwordInput) || prev.hasPassword,
        hasApiKey: Boolean(apiKeyInput) || prev.hasApiKey,
      }));
    } catch (err: any) {
      toast.error(err.message || "Error saving configuration", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testRecipient || !testRecipient.includes("@")) {
      toast.error("Please enter a valid recipient email");
      return;
    }

    setIsTesting(true);
    const toastId = toast.loading(`Sending test email to ${testRecipient}...`);

    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          toEmail: testRecipient,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.data?.error || "Test dispatch failed");
      }

      toast.success(data.message || "Test email delivered successfully!", { id: toastId });
      setShowTestModal(false);
      setSettings((prev) => ({
        ...prev,
        verified: true,
        verificationStatus: "VERIFIED",
      }));
      fetchLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch test email", { id: toastId });
      setSettings((prev) => ({
        ...prev,
        verified: false,
        verificationStatus: "FAILED",
        lastError: err.message,
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const isCustomConfigured = Boolean(settings.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] p-6 lg:p-10 font-sans text-slate-800 dark:text-slate-100">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <EnvelopeIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Email Architecture & Settings
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage sender identity, SMTP/API providers, and transactional delivery for {companyName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTestModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              Send Test Email
            </button>
          </div>
        </div>

        {/* Identity & Status Notice */}
        <div className="mt-6 p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="mt-0.5">
              {settings.verificationStatus === "VERIFIED" ? (
                <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
              ) : settings.verificationStatus === "FAILED" ? (
                <XCircleIcon className="w-6 h-6 text-rose-500" />
              ) : (
                <ShieldCheckIcon className="w-6 h-6 text-amber-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {isCustomConfigured
                    ? `Custom ${settings.provider} Gateway Active`
                    : "Platform Infrastructure Fallback Active"}
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    settings.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : settings.verificationStatus === "FAILED"
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                  }`}
                >
                  {settings.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isCustomConfigured
                  ? `Your store sends emails directly through your configured ${settings.provider} server.`
                  : "Emails send through SalesmanPro verified SMTP infrastructure with your store branding and customer replies directed to your store email."}
              </p>
              {settings.lastError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-mono">
                  Error: {settings.lastError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ServerStackIcon className="w-5 h-5 text-orange-500" />
              Provider Configuration
            </h2>

            {/* Provider Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Dispatch Gateway
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["SMTP", "RESEND", "SENDGRID"] as EmailProviderType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      provider === p
                        ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Identity Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Sender Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.fromName || ""}
                    onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                    placeholder={companyName}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.fromEmail || ""}
                    onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                    placeholder="orders@yourstore.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Reply-To Email Address
                </label>
                <input
                  type="email"
                  value={settings.replyTo || ""}
                  onChange={(e) => setSettings({ ...settings, replyTo: e.target.value })}
                  placeholder="support@yourstore.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Customer replies to automated order and inquiry emails will be routed to this inbox.
                </span>
              </div>
            </div>

            {/* Provider Credentials */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {provider === "SMTP" ? "SMTP Server Details" : `${provider} API Credentials`}
              </h3>

              {provider === "SMTP" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        required={provider === "SMTP"}
                        value={settings.host || ""}
                        onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                        placeholder="smtp.mailgun.org or smtp.hostinger.com"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        value={settings.port || 587}
                        onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value, 10) })}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={settings.username || ""}
                        onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                        placeholder="postmaster@yourstore.com"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        SMTP Password {settings.hasPassword && "(Saved & Encrypted)"}
                      </label>
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={settings.hasPassword ? "•••••••••••• (Leave blank to keep)" : "Enter password"}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="secureToggle"
                      checked={Boolean(settings.secure)}
                      onChange={(e) => setSettings({ ...settings, secure: e.target.checked })}
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                    />
                    <label htmlFor="secureToggle" className="text-xs text-slate-600 dark:text-slate-400">
                      Enable SSL / TLS Security (Recommended for Port 465)
                    </label>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {provider} API Key {settings.hasApiKey && "(Saved & Encrypted)"}
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={
                      settings.hasApiKey
                        ? "•••••••••••••••• (Leave blank to keep)"
                        : provider === "RESEND"
                        ? "re_..."
                        : "SG...."
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Your key is encrypted at rest using AES-256-GCM and never exposed to browser bundles.
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Security Info & Fast Logs */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
              Tenant Isolation Guarantee
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Your store email credentials are isolated to tenant ID{" "}
              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                {companyId.slice(-6)}
              </code>
              . No other store or unauthorized user can access or read your email secrets.
            </p>
            <div className="text-xs space-y-2 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                AES-256-GCM Encryption
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                SSRF Network Shield Active
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                BullMQ Retries & Backoff
              </div>
            </div>
          </div>

          {/* Quick Delivery Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Deliveries</h3>
              <button
                onClick={fetchLogs}
                disabled={isLoadingLogs}
                className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <ArrowPathIcon className={`w-3.5 h-3.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No emails sent yet</p>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                        {log.recipient}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === "SENT"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : log.status === "FAILED"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                      <span>{log.template}</span>
                      <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Send Test Email</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Dispatches a test message using {companyName}&apos;s current email configuration to verify end-to-end delivery.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="youremail@example.com"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isTesting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all disabled:opacity-50"
              >
                {isTesting ? "Sending..." : "Send Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
