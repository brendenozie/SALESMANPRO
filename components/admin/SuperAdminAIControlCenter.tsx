"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheckIcon,
  CpuChipIcon,
  KeyIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PowerIcon,
  Squares2X2Icon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  CircleStackIcon,
  LockClosedIcon,
  ShareIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

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

interface ActionPolicy {
  actionId: string;
  name: string;
  description: string;
  domain: string;
  primaryModelId: string;
  fallbackModelId: string;
  creditCost: number;
  enabled: boolean;
  deterministicAllowed: boolean;
  source: "database" | "registry_default";
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
    totalProviderCostUsd?: number;
    baselineCostUsd?: number;
    savingsUsd?: number;
    savingsPercentage?: number;
    deterministicRate?: number;
  };
  providerBreakdown?: Array<{
    provider: string;
    calls: number;
    tokens: number;
    creditsConsumed: number;
    fiatCostUsd: number;
  }>;
  recentAuditLogs: any[];
}

interface GlobalRoutingPolicyState {
  version: number;
  routingMode: "COST_FIRST" | "BALANCED" | "QUALITY_FIRST" | "PRIORITY_FIRST" | "PINNED" | "AUTOMATIC";
  globalKillSwitch: boolean;
  deterministicAllowedGlobally: boolean;
  maxProviderCostPerCallUsd: number;
  monthlySpendLimitUsd: number;
  dailySpendLimitUsd: number;
  defaultFallbackModelId: string;
}

export default function SuperAdminAIControlCenter() {
  const [activeTab, setActiveTab] = useState<"overview" | "providers" | "models" | "routing" | "logs" | "social">("overview");
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [configs, setConfigs] = useState<ServiceConfig[]>([]);
  const [actionPolicies, setActionPolicies] = useState<ActionPolicy[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [savingActionId, setSavingActionId] = useState<string | null>(null);
  const [saveSuccessActionId, setSaveSuccessActionId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [globalKillSwitch, setGlobalKillSwitch] = useState(false);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latencyMs?: number; error?: string } | null>(null);

  // Social Platform Config State
  const [socialPlatforms, setSocialPlatforms] = useState<any[]>([]);
  const [editingSocialPlatform, setEditingSocialPlatform] = useState<any | null>(null);
  const [socialClientId, setSocialClientId] = useState("");
  const [socialClientSecret, setSocialClientSecret] = useState("");
  const [socialRedirectUri, setSocialRedirectUri] = useState("");
  const [savingSocialConfig, setSavingSocialConfig] = useState(false);

  const [routingPolicy, setRoutingPolicy] = useState<GlobalRoutingPolicyState | null>(null);
  const [agentPolicies, setAgentPolicies] = useState<any[]>([]);
  const [routingView, setRoutingView] = useState<"actions" | "agents" | "simulator">("actions");
  const [simPrompt, setSimPrompt] = useState("Generate an engaging product description for a solar security camera");
  const [simMode, setSimMode] = useState<string>("AUTOMATIC");
  const [simResult, setSimResult] = useState<any | null>(null);
  const [runningSim, setRunningSim] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  // Key update modal state
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [newApiKey, setNewApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, mRes, cRes, aRes, sRes] = await Promise.all([
        fetch("/api/super-admin/ai/providers"),
        fetch("/api/super-admin/ai/models"),
        fetch("/api/super-admin/ai/config"),
        fetch("/api/super-admin/ai/analytics?days=30"),
        fetch("/api/super-admin/social/config").catch(() => null),
      ]);

      const [pData, mData, cData, aData, sData] = await Promise.all([
        pRes.json(),
        mRes.json(),
        cRes.json(),
        aRes.json(),
        sRes ? sRes.json().catch(() => ({})) : Promise.resolve({}),
      ]);

      if (pData.success) setProviders(pData.providers || []);
      if (mData.success) setModels(mData.models || []);
      if (cData.success) {
        setConfigs(cData.configs || []);
        setActionPolicies(cData.actionPolicies || []);
        setGlobalKillSwitch(Boolean(cData.globalKillSwitch));
        if (cData.routingPolicy) setRoutingPolicy(cData.routingPolicy);
        if (cData.agentPolicies) setAgentPolicies(cData.agentPolicies);
      }
      if (aData.success) {
        setAnalytics({
          metrics: aData.metrics,
          recentAuditLogs: aData.recentAuditLogs || [],
        });
      }
      if (sData?.success) {
        setSocialPlatforms(sData.platforms || []);
      }
    } catch (err) {
      console.error("Failed to load super admin AI data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActionPolicy = async (policy: ActionPolicy) => {
    setSavingActionId(policy.actionId);
    setSaveSuccessActionId(null);
    try {
      const res = await fetch("/api/super-admin/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionId: policy.actionId,
          primaryModelId: policy.primaryModelId,
          fallbackModelId: policy.fallbackModelId,
          creditCost: policy.creditCost,
          enabled: policy.enabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessActionId(policy.actionId);
        setTimeout(() => setSaveSuccessActionId(null), 3000);
        setActionPolicies((prev) =>
          prev.map((p) => (p.actionId === policy.actionId ? { ...p, ...policy, source: "database" } : p))
        );
      }
    } catch (err) {
      console.error("Failed to save action policy", err);
    } finally {
      setSavingActionId(null);
    }
  };

  const handleUpdateRoutingMode = async (mode: string) => {
    if (!routingPolicy) return;
    const updated = { ...routingPolicy, routingMode: mode as any };
    setRoutingPolicy(updated);
    try {
      await fetch("/api/super-admin/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateRoutingPolicy: { routingMode: mode } }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunSimulation = async () => {
    setRunningSim(true);
    try {
      const res = await fetch("/api/super-admin/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulateEvaluation: {
            prompt: simPrompt,
            routingModeOverride: simMode !== "DEFAULT" ? simMode : undefined,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data.simulation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunningSim(false);
    }
  };

  const handleRollbackPolicy = async () => {
    if (!confirm("Are you sure you want to rollback to the last known-good routing policy?")) return;
    setRollingBack(true);
    try {
      const res = await fetch("/api/super-admin/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollbackPolicy: true }),
      });
      const data = await res.json();
      if (data.success && data.routingPolicy) {
        setRoutingPolicy(data.routingPolicy);
        alert(`Successfully rolled back to policy version ${data.routingPolicy.version}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRollingBack(false);
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

  const handleSaveSocialConfig = async () => {
    if (!editingSocialPlatform) return;
    setSavingSocialConfig(true);
    try {
      const res = await fetch("/api/super-admin/social/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: editingSocialPlatform.platform,
          clientId: socialClientId,
          clientSecret: socialClientSecret,
          redirectUri: socialRedirectUri,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingSocialPlatform(null);
        setSocialClientSecret("");
        fetchData();
      } else {
        alert(data.error || "Failed to save social configuration");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setSavingSocialConfig(false);
    }
  };

  const handleToggleSocialPlatform = async (platform: string, currentEnabled: boolean) => {
    try {
      const res = await fetch("/api/super-admin/social/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          enabled: !currentEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 antialiased">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
              <ShieldCheckIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Super Admin AI Control Center
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
                  Confidential Root
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Authoritative provider credentials, global kill-switches, dynamic model routing, and unified telemetry.
              </p>
            </div>
          </div>

          {/* GLOBAL KILL SWITCH & REFRESH */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/super-admin/ai-workforce"
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-semibold transition-colors"
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span>AI Workforce (28 Agents)</span>
            </Link>

            <Link
              href="/super-admin/seo"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-800 rounded-xl font-medium text-xs tracking-wide transition-colors"
            >
              <GlobeAltIcon className="w-4 h-4" />
              <span>SEO & Discovery</span>
            </Link>

            <button
              onClick={handleToggleGlobalKillSwitch}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-colors ${globalKillSwitch
                  ? "bg-red-600 hover:bg-red-500 text-white border border-red-500"
                  : "bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30"
                }`}
            >
              <PowerIcon className="w-4 h-4" />
              <span>{globalKillSwitch ? "EMERGENCY: ALL AI DISABLED" : "Platform AI Active"}</span>
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-colors"
              title="Refresh telemetry"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1.5 mt-6 overflow-x-auto pb-2 border-b border-slate-800/80">
          {[
            { key: "overview", label: "Overview & Analytics", icon: ChartBarIcon },
            { key: "providers", label: "Providers & Key Vault", icon: KeyIcon },
            { key: "models", label: "Model Registry", icon: CpuChipIcon },
            { key: "routing", label: "Service Routing", icon: AdjustmentsHorizontalIcon },
            { key: "social", label: "Social Integrations", icon: ShareIcon },
            { key: "logs", label: "Audit Logs", icon: CircleStackIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${isSelected
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
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
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inferences</span>
                  <BoltIcon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-3">
                  {(analytics?.metrics.totalCalls ?? 0).toLocaleString()}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Past 30 days platform-wide</span>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tokens Processed</span>
                  <Squares2X2Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-3">
                  {(analytics?.metrics.totalTokens ?? 0).toLocaleString()}
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Input & output combined</span>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Provider Spend</span>
                  <CircleStackIcon className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-3">
                  ${(analytics?.metrics.totalProviderCostUsd ?? 0).toFixed(4)}
                </div>
                <span className="text-xs text-rose-400 mt-1 block font-medium">
                  Actual platform fiat cost (USD)
                </span>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Empirical Savings</span>
                  <BoltIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 mt-3">
                  {analytics?.metrics.savingsPercentage ?? 0}%
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  ${(analytics?.metrics.savingsUsd ?? 0).toFixed(2)} saved vs GPT-4o
                </span>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Zero-Cost Rate</span>
                  <ShieldCheckIcon className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-bold text-teal-300 mt-3">
                  {analytics?.metrics.deterministicRate ?? 0}%
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Autonomous in-memory execution</span>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform Health</span>
                  <ChartBarIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
                  {analytics?.metrics.failureRate === 0 ? "100%" : `${(100 - (analytics?.metrics.failureRate || 0)).toFixed(1)}%`}
                  <span className="text-xs font-semibold text-emerald-400">Uptime</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 block">Failure rate: {analytics?.metrics.failureRate ?? 0}%</span>
              </div>
            </div>

            {/* RECENT AUDIT SNAPSHOT */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-indigo-400" />
                <span>Recent Platform Inferences</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="uppercase bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
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
                  <tbody className="divide-y divide-slate-800">
                    {(analytics?.recentAuditLogs || []).slice(0, 10).map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">{log.action}</td>
                        <td className="py-3 px-4 text-slate-400">{log.provider}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{log.model || "—"}</td>
                        <td className="py-3 px-4 font-mono">{log.tokensUsed ? log.tokensUsed.toLocaleString() : "—"}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-400">{log.creditsCharged ?? "—"}</td>
                        <td className="py-3 px-4 text-slate-400">{log.latencyMs ? `${log.latencyMs}ms` : "—"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${log.status === "SUCCESS"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}
                          >
                            {log.status === "SUCCESS" ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-white">Central AI Provider Vault</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
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
                      className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between ${p.enabled
                          ? "bg-slate-950 border-slate-800"
                          : "bg-slate-950/40 border-slate-900 opacity-60"
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{p.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              {p.provider}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${p.isHealthy ? "bg-emerald-500" : "bg-red-500"
                                }`}
                              title={p.isHealthy ? "Healthy" : "Error on last test"}
                            />
                            <button
                              onClick={() => handleToggleProvider(p.id, p.enabled)}
                              className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${p.enabled
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
                                }`}
                            >
                              {p.enabled ? "Active" : "Disabled"}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                          {p.description || "Platform provider"}
                        </p>

                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 mb-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <LockClosedIcon className="w-3.5 h-3.5 text-amber-400" />
                              Encrypted Key:
                            </span>
                            <span className="font-mono text-slate-300 text-[11px]">
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
                            className={`p-2.5 mb-3 rounded-lg text-xs flex items-center gap-2 ${res.success
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}
                          >
                            {res.success ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                                <span>Verified! Ping latency: {res.latencyMs}ms</span>
                              </>
                            ) : (
                              <>
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                <span className="line-clamp-1">{res.error || "Connection test failed"}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setEditingProvider(p);
                            setNewApiKey("");
                          }}
                          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-800 transition-colors text-center"
                        >
                          Configure Key
                        </button>
                        <button
                          onClick={() => handleTestProvider(p.id)}
                          disabled={isTesting}
                          className="py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium rounded-xl border border-indigo-500/30 transition-colors flex items-center gap-1.5"
                        >
                          <ArrowPathIcon className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                          <span>Test</span>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-1">Platform AI Model Registry</h2>
            <p className="text-xs text-slate-400 mb-6">
              Registered models available for capability routing. Enable or disable models platform-wide.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="uppercase bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
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
                <tbody className="divide-y divide-slate-800">
                  {models.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{m.name}</td>
                      <td className="py-3 px-4 font-mono text-indigo-400">{m.modelId}</td>
                      <td className="py-3 px-4 text-slate-300">{m.provider?.name || "—"}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(m.capabilities || []).map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {m.contextWindow ? `${(m.contextWindow / 1000).toFixed(0)}k` : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {m.isDefault ? (
                          <span className="text-amber-400 font-medium">Default</span>
                        ) : (
                          <span className="text-slate-500">Secondary</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleModel(m.id, m.enabled)}
                          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${m.enabled
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-900 text-slate-500 border border-slate-800"
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

        {/* TAB 4: SERVICE ROUTING & ACTION CONTROL PLANE */}
        {activeTab === "routing" && (
          <div className="space-y-6">
            {/* GLOBAL ROUTING MODE CONTROLLER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Intelligent AI Model Orchestrator</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      Policy v{routingPolicy?.version ?? 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Centrally govern platform-wide model selection. The orchestrator automatically evaluates candidate suitability, fiat token costs, and uptime.
                  </p>
                </div>

                {/* Sub-view Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                  {[
                    { key: "actions", label: "Business Actions (16)" },
                    { key: "agents", label: "Agent Workforce (10)" },
                    { key: "simulator", label: "Policy Simulator & Rollback" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setRoutingView(tab.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        routingView === tab.key
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ROUTING MODE SELECTOR BAR */}
              <div className="mt-5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Active Platform Routing Mode
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {[
                    { mode: "COST_FIRST", label: "Cost-First", sub: "Lowest fiat USD / Zero-cost" },
                    { mode: "BALANCED", label: "Balanced", sub: "Cost + Quality trade-off" },
                    { mode: "QUALITY_FIRST", label: "Quality-First", sub: "Deep reasoning within cap" },
                    { mode: "PRIORITY_FIRST", label: "Priority-First", sub: "Ultra-low latency <500ms" },
                    { mode: "AUTOMATIC", label: "Automatic", sub: "Task complexity dynamic" },
                    { mode: "PINNED", label: "Pinned", sub: "Manual policy overrides" },
                  ].map((item) => {
                    const isCurrent = (routingPolicy?.routingMode || "BALANCED") === item.mode;
                    return (
                      <button
                        key={item.mode}
                        onClick={() => handleUpdateRoutingMode(item.mode)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? "bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isCurrent ? "text-indigo-400" : "text-slate-200"}`}>
                            {item.label}
                          </span>
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight">{item.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SUB-VIEW 1: BUSINESS ACTIONS */}
            {routingView === "actions" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Action-Level Routing Policies</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fine-grained primary and fallback model assignments per business operation.
                    </p>
                  </div>

                  {/* Domain Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    {["ALL", "COMMERCE", "WHATSAPP", "SCHOOL", "DOCUMENTS", "MARKETING", "MEDIA"].map((domain) => (
                      <button
                        key={domain}
                        onClick={() => setSelectedDomain(domain)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          selectedDomain === domain
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zero-Cost Resilience Notice */}
                <div className="p-3.5 mb-6 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3">
                  <BoltIcon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-200">
                    <span className="font-semibold text-white">Zero-Cost Autonomous AI Resilience: </span>
                    When external APIs are missing, suspended, or rate-limited, actions configured with or falling back to{" "}
                    <code className="px-1.5 py-0.5 rounded bg-indigo-900/60 font-mono text-indigo-300">salesmanpro-deterministic-v1</code>{" "}
                    execute automatically via the internal heuristics engine with 100% operational uptime and $0.00 provider fees.
                  </div>
                </div>

                {/* Action Policy Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {(actionPolicies.length > 0 ? actionPolicies : []).filter((p) =>
                    selectedDomain === "ALL" ? true : p.domain === selectedDomain
                  ).map((policy) => {
                    const isSaving = savingActionId === policy.actionId;
                    const isSaved = saveSuccessActionId === policy.actionId;
                    const isZeroCost =
                      policy.primaryModelId === "salesmanpro-deterministic-v1" ||
                      policy.fallbackModelId === "salesmanpro-deterministic-v1";

                    return (
                      <div
                        key={policy.actionId}
                        className={`p-5 rounded-2xl border transition-all ${
                          policy.enabled
                            ? "bg-slate-950 border-slate-800"
                            : "bg-slate-950/40 border-slate-900 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-sm">{policy.name}</h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                                {policy.domain}
                              </span>
                              {isZeroCost && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Zero-Cost Enabled
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-indigo-400 mt-0.5">{policy.actionId}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleUpdateActionPolicy({ ...policy, enabled: !policy.enabled })
                              }
                              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                                policy.enabled
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-slate-900 text-slate-400 border border-slate-800"
                              }`}
                            >
                              {policy.enabled ? "Active" : "Disabled"}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                          {policy.description}
                        </p>

                        <div className="space-y-3 p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                          {/* Primary Model Selector */}
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              Primary Assigned Model
                            </label>
                            <select
                              value={policy.primaryModelId}
                              onChange={(e) =>
                                setActionPolicies((prev) =>
                                  prev.map((p) =>
                                    p.actionId === policy.actionId
                                      ? { ...p, primaryModelId: e.target.value }
                                      : p
                                  )
                                )
                              }
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                            >
                              <option value="salesmanpro-deterministic-v1">
                                salesmanpro-deterministic-v1 (Zero-Cost Internal Engine)
                              </option>
                              {models.map((m) => (
                                <option key={`pri-${m.id}`} value={m.modelId}>
                                  {m.name} ({m.modelId})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Fallback Model Selector */}
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              Fallback Model
                            </label>
                            <select
                              value={policy.fallbackModelId}
                              onChange={(e) =>
                                setActionPolicies((prev) =>
                                  prev.map((p) =>
                                    p.actionId === policy.actionId
                                      ? { ...p, fallbackModelId: e.target.value }
                                      : p
                                  )
                                )
                              }
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                            >
                              <option value="salesmanpro-deterministic-v1">
                                salesmanpro-deterministic-v1 (Zero-Cost Internal Engine)
                              </option>
                              {models.map((m) => (
                                <option key={`fb-${m.id}`} value={m.modelId}>
                                  {m.name} ({m.modelId})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Credit Cost */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] text-slate-400">Credit Cost:</label>
                              <input
                                type="number"
                                min={0}
                                value={policy.creditCost}
                                onChange={(e) =>
                                  setActionPolicies((prev) =>
                                    prev.map((p) =>
                                      p.actionId === policy.actionId
                                        ? { ...p, creditCost: Math.max(0, parseInt(e.target.value) || 0) }
                                        : p
                                    )
                                  )
                                }
                                className="w-20 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-center font-mono text-xs text-amber-400 focus:outline-none focus:border-indigo-500"
                              />
                              <span className="text-[11px] text-slate-500">credits / call</span>
                            </div>

                            <div className="text-[10px] text-slate-500 font-mono">
                              {policy.source === "database" ? "DB Override" : "Registry Default"}
                            </div>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
                          <div>
                            {isSaved && (
                              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                                <CheckCircleIcon className="w-4 h-4" /> Policy Activated
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleUpdateActionPolicy(policy)}
                            disabled={isSaving}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            {isSaving ? (
                              <>
                                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <span>Save Policy</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: AGENT WORKFORCE & STAGES */}
            {routingView === "agents" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-1">Registered Platform Agents & Multi-Stage Policies</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Different stages of an agent workflow execute with tailored model policies (e.g. deterministic intent classification, reasoning generation, and schema validation).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agentPolicies.map((agent: any) => (
                    <div key={agent.agentKey} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{agent.name}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {agent.domain}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">{agent.agentKey}</span>
                        </div>
                        {agent.consequentialAction && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Human Approval Required
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mb-4">{agent.description}</p>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Default Mode:</span>
                          <span className="font-mono font-semibold text-indigo-400">{agent.defaultMode}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Primary Model:</span>
                          <span className="font-mono text-emerald-400">{agent.defaultPrimaryModel}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Fallback Model:</span>
                          <span className="font-mono text-slate-300">{agent.defaultFallbackModel}</span>
                        </div>

                        {agent.stageConfigs && (
                          <div className="pt-2 border-t border-slate-800 mt-2">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                              Execution Stages:
                            </span>
                            <div className="space-y-1">
                              {Object.entries(agent.stageConfigs).map(([stage, cfg]: [string, any]) => (
                                <div key={stage} className="flex items-center justify-between text-[11px] py-0.5 px-2 rounded bg-slate-950">
                                  <span className="font-mono text-slate-300">{stage}</span>
                                  <span className="text-indigo-300 font-semibold">{cfg.preferredMode}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: SIMULATOR & ROLLBACK */}
            {routingView === "simulator" && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Policy Dry-Run Simulator</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Test routing decisions without consuming real API calls or altering production states.
                      </p>
                    </div>

                    <button
                      onClick={handleRollbackPolicy}
                      disabled={rollingBack}
                      className="px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <ArrowPathIcon className={`w-3.5 h-3.5 ${rollingBack ? "animate-spin" : ""}`} />
                      <span>Rollback Policy</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Test Prompt</label>
                      <textarea
                        rows={3}
                        value={simPrompt}
                        onChange={(e) => setSimPrompt(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Simulated Routing Mode</label>
                        <select
                          value={simMode}
                          onChange={(e) => setSimMode(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        >
                          <option value="DEFAULT">Active Global Policy ({routingPolicy?.routingMode || "BALANCED"})</option>
                          <option value="COST_FIRST">COST_FIRST</option>
                          <option value="BALANCED">BALANCED</option>
                          <option value="QUALITY_FIRST">QUALITY_FIRST</option>
                          <option value="PRIORITY_FIRST">PRIORITY_FIRST</option>
                        </select>
                      </div>

                      <button
                        onClick={handleRunSimulation}
                        disabled={runningSim || !simPrompt}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                      >
                        {runningSim ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <BoltIcon className="w-4 h-4" />}
                        <span>Simulate Resolution</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulation Result Output */}
                  {simResult && (
                    <div className="mt-6 p-5 bg-slate-950 border border-slate-800 rounded-2xl">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase font-semibold text-slate-400">Winner:</span>
                            <span className="text-sm font-bold font-mono text-emerald-400">
                              {simResult.decision.selectedModelId}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {simResult.decision.routingMode}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{simResult.decision.reason}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Estimated Cost:</span>
                          <span className="text-sm font-mono font-bold text-amber-400">
                            ${(simResult.decision.estimatedProviderCostUsd ?? 0).toFixed(6)}
                          </span>
                          <span className="text-[11px] text-emerald-400 block mt-0.5">
                            {simResult.savingsPercentage}% cheaper than GPT-4o
                          </span>
                        </div>
                      </div>

                      {/* Candidate Score Table */}
                      <div className="mt-4">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                          Evaluated Candidates Breakdown:
                        </span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-900 text-slate-400">
                              <tr>
                                <th className="p-2">Model</th>
                                <th className="p-2">Eligible</th>
                                <th className="p-2">Score</th>
                                <th className="p-2">Cost (USD)</th>
                                <th className="p-2">Exclusion / Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                              {(simResult.decision.evaluatedCandidates || []).map((c: any) => (
                                <tr key={c.modelId} className="hover:bg-slate-900/40">
                                  <td className="p-2 text-white font-semibold">{c.modelId}</td>
                                  <td className="p-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${c.eligible ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                      {c.eligible ? "YES" : "NO"}
                                    </span>
                                  </td>
                                  <td className="p-2 text-indigo-300">{c.compositeScore}/100</td>
                                  <td className="p-2 text-amber-400">${(c.estimatedCostUsd ?? 0).toFixed(6)}</td>
                                  <td className="p-2 text-slate-400 text-[11px]">{c.exclusionReason || "Optimal Candidate"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === "logs" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-1">Unified AI Audit Trail</h2>
            <p className="text-xs text-slate-400 mb-6">
              Full immutable accounting log of all platform inferences, token usage, latency, and credit billing.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="uppercase bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
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
                <tbody className="divide-y divide-slate-800 font-mono">
                  {(analytics?.recentAuditLogs || []).map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-950/50 transition-colors">
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
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${log.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
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

        {/* TAB 6: SOCIAL PLATFORM INTEGRATIONS */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Social Platform App Integrations & OAuth Vault</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Global app client credentials, OAuth redirect endpoints, and kill-switches for Facebook, Instagram, TikTok & YouTube.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(socialPlatforms.length > 0
                ? socialPlatforms
                : [
                  { platform: "FACEBOOK", enabled: true, hasSecret: false },
                  { platform: "INSTAGRAM", enabled: true, hasSecret: false },
                  { platform: "TIKTOK", enabled: true, hasSecret: false },
                  { platform: "YOUTUBE", enabled: true, hasSecret: false },
                ]
              ).map((sp: any) => (
                <div
                  key={sp.platform}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                        <ShareIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">{sp.platform}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {sp.platform === "FACEBOOK" && "Meta Graph API v19+ (Pages & Feed)"}
                          {sp.platform === "INSTAGRAM" && "Instagram Graph API (Professional & Reels)"}
                          {sp.platform === "TIKTOK" && "TikTok Content Posting API v2"}
                          {sp.platform === "YOUTUBE" && "YouTube Data API v3 (Videos & Shorts)"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSocialPlatform(sp.platform, sp.enabled)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${sp.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                    >
                      <PowerIcon className="w-3.5 h-3.5" />
                      <span>{sp.enabled ? "Active" : "Disabled"}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-sans">App Client ID:</span>
                      <span className="text-white truncate max-w-[200px]">{sp.clientId || "Not Configured"}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-sans">App Secret:</span>
                      <span className={sp.hasSecret ? "text-emerald-400" : "text-amber-400"}>
                        {sp.hasSecret ? "Encrypted (AES-256-GCM)" : "Missing Secret"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-sans">Redirect URI:</span>
                      <span className="text-slate-300 truncate max-w-[200px]">{sp.redirectUri || "Default Callback"}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        setEditingSocialPlatform(sp);
                        setSocialClientId(sp.clientId || "");
                        setSocialClientSecret("");
                        setSocialRedirectUri(sp.redirectUri || "");
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-medium rounded-xl transition-colors"
                    >
                      <KeyIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Configure App Credentials</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KEY CONFIG MODAL */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Configure {editingProvider.name} API Key</h3>
                <p className="text-xs text-slate-400 mt-0.5">Key is encrypted with AES-256-GCM before DB insertion.</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Secret API Key
              </label>
              <input
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingProvider(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={savingKey || !newApiKey.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-colors"
              >
                {savingKey ? "Encrypting & Storing..." : "Save Encrypted Key"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOCIAL PLATFORM CREDENTIALS MODAL */}
      {editingSocialPlatform && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                <ShareIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Configure {editingSocialPlatform.platform} App Credentials
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client Secrets are encrypted using AES-256-GCM before persistent storage.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  App Client ID / Key
                </label>
                <input
                  type="text"
                  value={socialClientId}
                  onChange={(e) => setSocialClientId(e.target.value)}
                  placeholder="e.g. 1029384756..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  App Client Secret (Leave blank to keep existing secret)
                </label>
                <input
                  type="password"
                  value={socialClientSecret}
                  onChange={(e) => setSocialClientSecret(e.target.value)}
                  placeholder={editingSocialPlatform.hasSecret ? "••••••••••••••••" : "Paste client secret"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Redirect Callback URI (Optional override)
                </label>
                <input
                  type="text"
                  value={socialRedirectUri}
                  onChange={(e) => setSocialRedirectUri(e.target.value)}
                  placeholder="https://app.salesmanpro.com/api/social/callback/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingSocialPlatform(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSocialConfig}
                disabled={savingSocialConfig}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-colors"
              >
                {savingSocialConfig ? "Encrypting & Storing..." : "Save Credentials"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}