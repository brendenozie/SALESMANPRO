"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Cpu,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Power,
  Layers,
  Zap,
  Sliders,
  Database,
  Search,
  Lock,
} from "lucide-react";

interface Provider {
  id: string;
  provider: string;
  name: string;
  description?: string;
  enabled: boolean;
  isHealthy: boolean;
  hasKey: boolean;
  maskedKey: string | null;
  lastTestedAt?: string;
  lastError?: string;
  rateLimitRpm?: number;
  priority: number;
}

interface Model {
  id: string;
  providerId: string;
  modelId: string;
  name: string;
  capabilities: string[];
  contextWindow?: number;
  enabled: boolean;
  isDefault: boolean;
  provider?: { name: string; provider: string };
}

interface ServiceConfig {
  id: string;
  serviceKey: string;
  provider: string;
  modelId: string;
  fallbackProvider?: string;
  fallbackModelId?: string;
  creditCost: number;
  enabled: boolean;
}

interface AnalyticsData {
  metrics: {
    totalCalls: number;
    totalTokens: number;
    totalCreditsConsumed: number;
    totalCreditsPurchased: number;
    totalJobs: number;
    failedJobs: number;
    failureRate: number;
  };
  recentAuditLogs: any[];
}

export default function SuperAdminAIControlCenter() {
  const [activeTab, setActiveTab] = useState<"overview" | "providers" | "models" | "routing" | "logs">("overview");
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [configs, setConfigs] = useState<ServiceConfig[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [globalKillSwitch, setGlobalKillSwitch] = useState(false);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latencyMs?: number; error?: string } | null>(null);

  // Key update modal state
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [newApiKey, setNewApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, mRes, cRes, aRes] = await Promise.all([
        fetch("/api/super-admin/ai/providers"),
        fetch("/api/super-admin/ai/models"),
        fetch("/api/super-admin/ai/config"),
        fetch("/api/super-admin/ai/analytics?days=30"),
      ]);

      const [pData, mData, cData, aData] = await Promise.all([
        pRes.json(),
        mRes.json(),
        cRes.json(),
        aRes.json(),
      ]);

      if (pData.success) setProviders(pData.providers || []);
      if (mData.success) setModels(mData.models || []);
      if (cData.success) {
        setConfigs(cData.configs || []);
        setGlobalKillSwitch(Boolean(cData.globalKillSwitch));
      }
      if (aData.success) {
        setAnalytics({
          metrics: aData.metrics,
          recentAuditLogs: aData.recentAuditLogs || [],
        });
      }
    } catch (err) {
      console.error("Failed to load super admin AI data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleGlobalKillSwitch = async () => {
    const nextState = !globalKillSwitch;
    if (nextState) {
      const confirmKill = confirm("EMERGENCY KILL SWITCH: Are you sure you want to disable all AI services platform-wide?");
      if (!confirmKill) return;
    }

    try {
      const res = await fetch("/api/super-admin/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalKillSwitch: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        setGlobalKillSwitch(data.globalKillSwitch);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProvider = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch(`/api/super-admin/ai/providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setProviders((prev) =>
          prev.map((p) => (p.id === id ? { ...p, enabled: !currentEnabled } : p)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestProvider = async (id: string) => {
    setTestingProviderId(id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/super-admin/ai/providers/${id}/test`, {
        method: "POST",
      });
      const data = await res.json();
      setTestResult({
        id,
        success: data.success,
        latencyMs: data.latencyMs,
        error: data.error,
      });
      if (data.success) {
        setProviders((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isHealthy: true, lastTestedAt: new Date().toISOString() } : p)),
        );
      }
    } catch (err: any) {
      setTestResult({ id, success: false, error: err.message });
    } finally {
      setTestingProviderId(null);
    }
  };

  const handleSaveApiKey = async () => {
    if (!editingProvider || !newApiKey.trim()) return;
    setSavingKey(true);
    try {
      const res = await fetch("/api/super-admin/ai/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: editingProvider.provider,
          name: editingProvider.name,
          apiKey: newApiKey.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProviders((prev) =>
          prev.map((p) =>
            p.id === editingProvider.id ? { ...p, hasKey: true, maskedKey: "sk-••••••••" + p.provider } : p,
          ),
        );
        setEditingProvider(null);
        setNewApiKey("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingKey(false);
    }
  };

  const handleToggleModel = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch("/api/super-admin/ai/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setModels((prev) =>
          prev.map((m) => (m.id === id ? { ...m, enabled: !currentEnabled } : m)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  Super Admin AI Control Center
                  <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                    Confidential Root
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Authoritative provider credentials, global kill-switches, dynamic model routing, and unified telemetry.
                </p>
              </div>
            </div>
          </div>

          {/* GLOBAL KILL SWITCH */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleGlobalKillSwitch}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
                globalKillSwitch
                  ? "bg-red-600 hover:bg-red-500 text-white shadow-red-900/30 border border-red-500 animate-pulse"
                  : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 shadow-emerald-950/20"
              }`}
            >
              <Power className="w-4 h-4" />
              {globalKillSwitch ? "EMERGENCY: ALL AI DISABLED" : "Platform AI Active"}
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 border-b border-slate-800/60">
          {[
            { key: "overview", label: "Overview & Analytics", icon: Activity },
            { key: "providers", label: "Providers & Key Vault", icon: Key },
            { key: "models", label: "Model Registry", icon: Cpu },
            { key: "routing", label: "Service Routing", icon: Sliders },
            { key: "logs", label: "Audit Logs", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Inferences</span>
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {(analytics?.metrics.totalCalls ?? 0).toLocaleString()}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Past 30 days platform-wide</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Tokens Processed</span>
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {(analytics?.metrics.totalTokens ?? 0).toLocaleString()}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Input & output combined</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Credits Purchased</span>
                  <Database className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {(analytics?.metrics.totalCreditsPurchased ?? 0).toLocaleString()}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Paid store wallet top-ups</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Platform Health</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
                  {analytics?.metrics.failureRate === 0 ? "100%" : `${(100 - (analytics?.metrics.failureRate || 0)).toFixed(1)}%`}
                  <span className="text-xs font-normal text-emerald-400">Uptime</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Failure rate: {analytics?.metrics.failureRate ?? 0}%</span>
              </div>
            </div>

            {/* RECENT AUDIT SNAPSHOT */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Recent Platform Inferences
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Provider</th>
                      <th className="py-3 px-4">Model</th>
                      <th className="py-3 px-4">Tokens</th>
                      <th className="py-3 px-4">Credits</th>
                      <th className="py-3 px-4">Latency</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(analytics?.recentAuditLogs || []).slice(0, 10).map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 font-medium text-white">{log.action}</td>
                        <td className="py-3 px-4 text-slate-400">{log.provider}</td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-300">{log.model || "—"}</td>
                        <td className="py-3 px-4 font-mono text-xs">{log.tokensUsed ? log.tokensUsed.toLocaleString() : "—"}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-400">{log.creditsCharged ?? "—"}</td>
                        <td className="py-3 px-4 text-slate-400">{log.latencyMs ? `${log.latencyMs}ms` : "—"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.status === "SUCCESS"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {log.status === "SUCCESS" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(analytics?.recentAuditLogs || []).length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No audit telemetry recorded yet. Live requests will stream here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROVIDERS & KEY VAULT */}
        {activeTab === "providers" && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Central AI Provider Vault</h2>
                  <p className="text-sm text-slate-400">
                    API keys configured here are encrypted using AES-256-GCM. Stores never provide or see credentials.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((p) => {
                  const isTesting = testingProviderId === p.id;
                  const res = testResult?.id === p.id ? testResult : null;

                  return (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                        p.enabled
                          ? "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                          : "bg-slate-950/50 border-slate-900 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{p.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {p.provider}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                p.isHealthy ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-red-500 shadow-sm shadow-red-500/50"
                              }`}
                              title={p.isHealthy ? "Healthy" : "Error on last test"}
                            />
                            <button
                              onClick={() => handleToggleProvider(p.id, p.enabled)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                                p.enabled
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                              }`}
                            >
                              {p.enabled ? "Active" : "Disabled"}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{p.description || "Platform provider"}</p>

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-amber-400" />
                              Encrypted Key:
                            </span>
                            <span className="font-mono text-slate-300">
                              {p.hasKey ? p.maskedKey : <span className="text-amber-400">Using ENV fallback</span>}
                            </span>
                          </div>
                          {p.lastTestedAt && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Last Verified:</span>
                              <span>{new Date(p.lastTestedAt).toLocaleTimeString()}</span>
                            </div>
                          )}
                        </div>

                        {res && (
                          <div
                            className={`p-2.5 mb-3 rounded-lg text-xs flex items-center gap-2 ${
                              res.success
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {res.success ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Verified! Ping latency: {res.latencyMs}ms</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span className="line-clamp-1">{res.error || "Connection test failed"}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => {
                            setEditingProvider(p);
                            setNewApiKey("");
                          }}
                          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition text-center"
                        >
                          Configure Key
                        </button>
                        <button
                          onClick={() => handleTestProvider(p.id)}
                          disabled={isTesting}
                          className="py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium rounded-xl border border-indigo-500/30 transition flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                          Test
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MODEL REGISTRY */}
        {activeTab === "models" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Platform AI Model Registry</h2>
            <p className="text-sm text-slate-400 mb-6">
              Registered models available for capability routing. Enable or disable models platform-wide.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Model Name</th>
                    <th className="py-3 px-4">Model ID</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Capabilities</th>
                    <th className="py-3 px-4">Context Window</th>
                    <th className="py-3 px-4">Default</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {models.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">{m.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-indigo-400">{m.modelId}</td>
                      <td className="py-3 px-4 text-slate-300">{m.provider?.name || "—"}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(m.capabilities || []).map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {m.contextWindow ? `${(m.contextWindow / 1000).toFixed(0)}k` : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {m.isDefault ? (
                          <span className="text-xs text-amber-400 font-medium">Default</span>
                        ) : (
                          <span className="text-xs text-slate-500">Secondary</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleModel(m.id, m.enabled)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                            m.enabled
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-500 border border-slate-700"
                          }`}
                        >
                          {m.enabled ? "Active" : "Disabled"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICE ROUTING */}
        {activeTab === "routing" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Capability & Service Routing</h2>
            <p className="text-sm text-slate-400 mb-6">
              Maps platform capabilities to primary and fallback providers and configures base credit costs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.map((c) => (
                <div key={c.id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-white text-base">{c.serviceKey}</span>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {c.creditCost} Credits / call
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50">
                      <span className="text-slate-400">Primary Route:</span>
                      <span className="font-mono text-emerald-400">
                        {c.provider} ({c.modelId})
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50">
                      <span className="text-slate-400">Fallback Route:</span>
                      <span className="font-mono text-slate-300">
                        {c.fallbackProvider ? `${c.fallbackProvider} (${c.fallbackModelId})` : "None"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === "logs" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Unified AI Audit Trail</h2>
            <p className="text-sm text-slate-400 mb-6">
              Full immutable accounting log of all platform inferences, token usage, latency, and credit billing.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Provider / Model</th>
                    <th className="py-3 px-4">Tokens</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {(analytics?.recentAuditLogs || []).map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-white">{log.action}</td>
                      <td className="py-3 px-4 text-indigo-400">
                        {log.provider} / {log.model || "—"}
                      </td>
                      <td className="py-3 px-4">{log.tokensUsed ?? "—"}</td>
                      <td className="py-3 px-4 font-semibold text-amber-400">{log.creditsCharged ?? "—"}</td>
                      <td className="py-3 px-4 text-slate-400">{log.latencyMs ? `${log.latencyMs}ms` : "—"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(analytics?.recentAuditLogs || []).length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                        No audit logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* KEY CONFIG MODAL */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Configure {editingProvider.name} API Key</h3>
                <p className="text-xs text-slate-400">Key is encrypted with AES-256-GCM before DB insertion.</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Secret API Key
              </label>
              <input
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingProvider(null)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={savingKey || !newApiKey.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
              >
                {savingKey ? "Encrypting & Storing..." : "Save Encrypted Key"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
