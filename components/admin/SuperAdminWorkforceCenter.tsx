"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheckIcon,
  CpuChipIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PowerIcon,
  Squares2X2Icon,
  BoltIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
  ShoppingBagIcon,
  UserPlusIcon,
  QueueListIcon,
  PlayIcon,
  PaperAirplaneIcon,
  EyeIcon,
  PlusIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface Agent {
  key: string;
  name: string;
  level: "STORE" | "PLATFORM" | "MARKETPLACE";
  roleDescription: string;
  systemPrompt: string;
  currentPermission: string;
  enabled: boolean;
  allowedTools: string[];
  currentDailyCreditLimit: number;
  badge?: string;
  exampleQueries?: string[];
  totalTasksExecuted: number;
}

interface Prospect {
  id: string;
  businessName: string;
  category: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  digitalMaturityScore: number;
  ecommerceOpportunityScore: number;
  overallLeadScore: number;
  status: string;
  outreachCount: number;
  createdAt: string;
}

interface SupplyGap {
  id: string;
  category: string;
  location: string;
  unmetSearchVolume: number;
  activeListingCount: number;
  urgencyLevel: string;
  recommendedSellersCount: number;
  status: string;
  updatedAt: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
  agent?: {
    name: string;
    level: string;
  };
}

interface ApprovalItem {
  id: string;
  title: string;
  description?: string;
  actionType: string;
  proposedAction: any;
  status: string;
  agent?: {
    name: string;
  };
}

export default function SuperAdminWorkforceCenter() {
  const [activeTab, setActiveTab] = useState<"workforce" | "acquisition" | "marketplace" | "operations" | "apis" | "intelligence" | "safety">("workforce");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "STORE" | "PLATFORM" | "MARKETPLACE">("ALL");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [supplyGaps, setSupplyGaps] = useState<SupplyGap[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Growth & Search API State
  const [growthSettings, setGrowthSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [editingTarget, setEditingTarget] = useState<"SERPAPI" | "GOOGLE_SEARCH" | "META_WHATSAPP" | null>(null);
  const [inputApiKey, setInputApiKey] = useState("");
  const [inputCseId, setInputCseId] = useState("");
  const [inputWabaId, setInputWabaId] = useState("");
  const [inputPhoneId, setInputPhoneId] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingSearch, setTestingSearch] = useState(false);
  const [testSearchProvider, setTestSearchProvider] = useState<"SERPAPI" | "GOOGLE_SEARCH">("SERPAPI");
  const [searchTestResults, setSearchTestResults] = useState<any>(null);
  const [registeringMetaTemplate, setRegisteringMetaTemplate] = useState(false);
  const [metaTemplateResult, setMetaTemplateResult] = useState<any>(null);

  // Execution Modal state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [taskPrompt, setTaskPrompt] = useState("");
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // New Prospect Modal state
  const [showProspectModal, setShowProspectModal] = useState(false);
  const [newProspect, setNewProspect] = useState({
    businessName: "",
    category: "Retail",
    location: "Nairobi, Kenya",
    phone: "",
    email: "",
    website: "",
    digitalMaturityScore: 30,
    ecommerceOpportunityScore: 70,
  });

  const fetchGrowthSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await fetch("/api/super-admin/ai/growth-settings");
      const data = await res.json();
      if (data.success) {
        setGrowthSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load growth settings", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveGrowthSettings = async (target: "SERPAPI" | "GOOGLE_SEARCH" | "META_WHATSAPP") => {
    try {
      setSavingSettings(true);
      const payload: any = { target, apiKey: inputApiKey };
      if (target === "GOOGLE_SEARCH") {
        payload.metadata = { searchEngineId: inputCseId };
      } else if (target === "META_WHATSAPP") {
        payload.metadata = { wabaId: inputWabaId, phoneNumberId: inputPhoneId };
      }

      const res = await fetch("/api/super-admin/ai/growth-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEditingTarget(null);
        setInputApiKey("");
        setInputCseId("");
        setInputWabaId("");
        setInputPhoneId("");
        await fetchGrowthSettings();
      } else {
        alert("Failed to save settings: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error saving settings: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestSearch = async (provider: "SERPAPI" | "GOOGLE_SEARCH") => {
    try {
      setTestingSearch(true);
      setSearchTestResults(null);
      const res = await fetch("/api/super-admin/ai/growth-settings/test-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, category: "Hardware", location: "Nairobi" }),
      });
      const data = await res.json();
      setSearchTestResults(data);
    } catch (err: any) {
      setSearchTestResults({ success: false, error: err.message });
    } finally {
      setTestingSearch(false);
    }
  };

  const handleRegisterMetaTemplate = async () => {
    try {
      setRegisteringMetaTemplate(true);
      setMetaTemplateResult(null);
      const res = await fetch("/api/super-admin/ai/growth-settings/register-meta-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setMetaTemplateResult(data);
      if (data.success) {
        await fetchGrowthSettings();
      }
    } catch (err: any) {
      setMetaTemplateResult({ success: false, error: err.message });
    } finally {
      setRegisteringMetaTemplate(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, prospectsRes, gapsRes, tasksRes, approvalsRes] = await Promise.all([
        fetch("/api/ai/workforce/agents"),
        fetch("/api/ai/workforce/growth/prospects"),
        fetch("/api/ai/workforce/marketplace/gaps"),
        fetch("/api/ai/workforce/tasks?limit=25"),
        fetch("/api/ai/workforce/approvals?status=PENDING"),
      ]);

      const [agentsData, prospectsData, gapsData, tasksData, approvalsData] = await Promise.all([
        agentsRes.json(),
        prospectsRes.json(),
        gapsRes.json(),
        tasksRes.json(),
        approvalsRes.json(),
      ]);

      if (agentsData.success) setAgents(agentsData.agents || []);
      if (prospectsData.success) {
        setProspects(prospectsData.prospects || []);
        setStatusCounts(prospectsData.statusCounts || {});
      }
      if (gapsData.success) setSupplyGaps(gapsData.gaps || []);
      if (tasksData.success) setTasks(tasksData.tasks || []);
      if (approvalsData.success) setApprovals(approvalsData.approvals || []);
      await fetchGrowthSettings();
    } catch (err) {
      console.error("Failed to load Super Admin Workforce data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunAgent = async () => {
    if (!selectedAgent || !taskPrompt.trim()) return;
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch("/api/ai/workforce/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentKey: selectedAgent.key,
          prompt: taskPrompt,
          channel: "WEB",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExecutionResult(data.result);
        fetchData();
      } else {
        alert(data.error || "Failed to execute agent");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleCreateProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/ai/workforce/growth/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProspect),
      });
      const data = await res.json();
      if (data.success) {
        setShowProspectModal(false);
        setNewProspect({
          businessName: "",
          category: "Retail",
          location: "Nairobi, Kenya",
          phone: "",
          email: "",
          website: "",
          digitalMaturityScore: 30,
          ecommerceOpportunityScore: 70,
        });
        fetchData();
      } else {
        alert(data.error || "Failed to create prospect");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleResolveApproval = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/ai/workforce/approvals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setApprovals((prev) => prev.filter((a) => a.id !== id));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAgents = levelFilter === "ALL" ? agents : agents.filter((a) => a.level === levelFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Super Admin AI Command Center
            </span>
            <span className="text-xs text-slate-400">SalesmanPro SaaS & Ghuba Marketplace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <CpuChipIcon className="w-8 h-8 text-indigo-400" />
            AI Workforce & Growth Architecture
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Centralized orchestration of the 3-Tier AI Workforce: Store Employees, SaaS Acquisition, and Marketplace Liquidity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/super-admin/ai"
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <CpuChipIcon className="w-4 h-4 text-indigo-400" />
            AI Models & Keys
          </Link>

          <Link
            href="/super-admin/email"
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4 text-blue-400" />
            Email Infrastructure
          </Link>

          {/* Global Kill Switch */}
          <button
            onClick={() => setKillSwitchActive(!killSwitchActive)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors ${
              killSwitchActive
                ? "bg-rose-600 text-white border-rose-500 hover:bg-rose-500"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
            }`}
          >
            <PowerIcon className="w-4 h-4" />
            {killSwitchActive ? "Global AI Paused" : "Platform AI Active"}
          </button>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("workforce")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "workforce"
              ? "border-indigo-400 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Squares2X2Icon className="w-4 h-4" />
          Workforce Rosters ({agents.length})
        </button>

        <button
          onClick={() => setActiveTab("acquisition")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "acquisition"
              ? "border-indigo-400 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <GlobeAltIcon className="w-4 h-4" />
          SaaS Acquisition Pipeline ({prospects.length})
        </button>

        <button
          onClick={() => setActiveTab("marketplace")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "marketplace"
              ? "border-indigo-400 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShoppingBagIcon className="w-4 h-4" />
          Ghuba Marketplace Liquidity ({supplyGaps.length})
        </button>

        <button
          onClick={() => setActiveTab("operations")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "operations"
              ? "border-indigo-400 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <QueueListIcon className="w-4 h-4" />
          Queue & Operations ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab("intelligence")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "intelligence"
              ? "border-indigo-400 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ChartBarIcon className="w-4 h-4" />
          Intelligence & Insights
        </button>

        <button
          onClick={() => setActiveTab("safety")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors relative ${
            activeTab === "safety"
              ? "border-indigo-400 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          Safety & Approvals
          {approvals.length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 text-xs rounded-full">
              {approvals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("apis");
            fetchGrowthSettings();
          }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "apis"
              ? "border-indigo-400 text-indigo-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <KeyIcon className="w-4 h-4" />
          Growth & Search APIs
        </button>
      </div>

      {/* Tab 1: Workforce Rosters */}
      {activeTab === "workforce" && (
        <div className="space-y-6">
          {/* Level Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: "ALL", label: "All Workforce Tiers" },
              { id: "STORE", label: "Level 1: Store Employees (13)" },
              { id: "PLATFORM", label: "Level 2: SaaS Growth (9)" },
              { id: "MARKETPLACE", label: "Level 3: Ghuba Marketplace (6)" },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setLevelFilter(pill.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                  levelFilter === pill.id
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAgents.map((agent) => (
              <div
                key={agent.key}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                        agent.level === "STORE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : agent.level === "PLATFORM"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {agent.level} TIER
                    </span>
                    <span className="text-xs text-slate-400">{agent.currentPermission}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5">{agent.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {agent.roleDescription}
                  </p>

                  <div className="text-[11px] text-slate-400 space-y-1 mb-4">
                    <div>
                      <strong>Tools:</strong> {agent.allowedTools.slice(0, 3).join(", ")}
                      {agent.allowedTools.length > 3 && ` +${agent.allowedTools.length - 3}`}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Tasks: <strong className="text-white">{agent.totalTasksExecuted}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedAgent(agent);
                      setTaskPrompt(agent.exampleQueries?.[0] || "");
                      setExecutionResult(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <PlayIcon className="w-3.5 h-3.5" />
                    Test Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: SaaS Acquisition Pipeline */}
      {activeTab === "acquisition" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5 text-indigo-400" />
                SalesmanPro Outbound Acquisition Engine
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Targeting Kenyan & African merchants: public research, digital maturity scoring, and contact limits.
              </p>
            </div>
            <button
              onClick={() => setShowProspectModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Target Prospect
            </button>
          </div>

          {/* Prospects Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Digital Maturity</th>
                  <th className="py-3 px-4">Lead Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {prospects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-white">{p.businessName}</td>
                    <td className="py-3.5 px-4">{p.category}</td>
                    <td className="py-3.5 px-4 text-slate-400">{p.location}</td>
                    <td className="py-3.5 px-4">
                      <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-1.5 rounded-full"
                          style={{ width: `${p.digitalMaturityScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{p.digitalMaturityScore}/100</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{p.overallLeadScore}/100</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          const agent = agents.find((a) => a.key === "OUTBOUND_AGENT");
                          if (agent) {
                            setSelectedAgent(agent);
                            setTaskPrompt(
                              `Draft a high-converting, personalized outreach pitch for ${p.businessName} (${p.category} in ${p.location}) offering an online storefront demo.`,
                            );
                            setExecutionResult(null);
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-medium"
                      >
                        Draft Pitch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Ghuba Marketplace Liquidity */}
      {activeTab === "marketplace" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-amber-400" />
              Ghuba Marketplace Supply & Demand Gap Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time monitoring of unmet buyer search queries, category liquidity, and seller acquisition targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {supplyGaps.map((gap) => (
              <div key={gap.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white px-2 py-0.5 rounded bg-slate-800">
                    {gap.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      gap.urgencyLevel === "HIGH"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {gap.urgencyLevel} URGENCY
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>Location: <strong className="text-slate-200">{gap.location}</strong></div>
                  <div>Unmet Search Volume: <strong className="text-amber-400">+{gap.unmetSearchVolume} searches</strong></div>
                  <div>Active Listings: <strong className="text-slate-200">{gap.activeListingCount}</strong></div>
                  <div>Recommended Suppliers: <strong className="text-slate-200">{gap.recommendedSellersCount} merchants</strong></div>
                </div>

                <button
                  onClick={() => {
                    const agent = agents.find((a) => a.key === "SELLER_RECRUITMENT_AGENT");
                    if (agent) {
                      setSelectedAgent(agent);
                      setTaskPrompt(
                        `Recruit 3 prospective merchants in ${gap.location} selling ${gap.category} to fulfill our active marketplace supply gap.`,
                      );
                      setExecutionResult(null);
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold transition-colors"
                >
                  Deploy Seller Recruitment Agent
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Operations & Queue */}
      {activeTab === "operations" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <QueueListIcon className="w-5 h-5 text-indigo-400" />
              Workforce Task Queue & Real-time Telemetry
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active BullMQ worker execution logs, latencies, and token accounting across all agents.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Cost (Credits)</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-white">{t.title}</td>
                    <td className="py-3 px-4 text-slate-300">{t.agent?.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {t.agent?.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : t.status === "RUNNING"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{t.creditsUsed} cr</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(t.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Intelligence & Growth Insights */}
      {activeTab === "intelligence" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-indigo-400" />
              SaaS & Marketplace Expansion Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Cross-cutting strategic signals: category opportunity, geographic density, digital maturity gaps, and revenue expansion vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Expansion Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Squares2X2Icon className="w-4 h-4 text-emerald-400" />
                Category Opportunity Matrix
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { name: "Electronics & Phones", demand: "Very High", readiness: "65%", opportunity: 92 },
                  { name: "Agrovet & Farming", demand: "High", readiness: "40%", opportunity: 88 },
                  { name: "Hardware & Building", demand: "High", readiness: "45%", opportunity: 85 },
                  { name: "Fashion & Apparel", demand: "Moderate", readiness: "75%", opportunity: 79 },
                  { name: "Salons & Barbershops", demand: "Moderate", readiness: "55%", opportunity: 74 },
                ].map((cat, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">{cat.name}</div>
                      <div className="text-[11px] text-slate-400">Demand: {cat.demand} • Digital: {cat.readiness}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{cat.opportunity}</div>
                      <div className="text-[10px] text-slate-400">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Expansion Hubs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GlobeAltIcon className="w-4 h-4 text-indigo-400" />
                Regional Commerce Hubs
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { city: "Nairobi (CBD & Westlands)", activeStores: 142, potentialProspects: "1,200+", growthVector: "POS + WhatsApp" },
                  { city: "Kisumu (Nyanza Hub)", activeStores: 38, potentialProspects: "450+", growthVector: "Marketplace Supply" },
                  { city: "Mombasa (Coast Hub)", activeStores: 44, potentialProspects: "600+", growthVector: "Wholesale & Logistics" },
                  { city: "Eldoret (Rift Hub)", activeStores: 26, potentialProspects: "380+", growthVector: "Agrovet & Hardware" },
                  { city: "Nakuru (Central Hub)", activeStores: 31, potentialProspects: "410+", growthVector: "Retail & Services" },
                ].map((geo, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">{geo.city}</div>
                      <div className="text-[11px] text-slate-400">{geo.potentialProspects} prospects • {geo.growthVector}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-indigo-400">{geo.activeStores}</div>
                      <div className="text-[10px] text-slate-400">Stores</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Revenue & Churn Health */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BoltIcon className="w-4 h-4 text-amber-400" />
                Retention & Upsell Vectors
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-slate-200">WhatsApp Commerce Adoption</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Stores with WhatsApp catalog links demonstrate 3.2x higher 90-day retention compared to web-only stores.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-slate-200">Ghuba Dual-Listing Advantage</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Merchants listing at least 5 products on Ghuba Marketplace experience 48% more order volume in their first 30 days.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="font-semibold text-slate-200">AI Workforce Retention Impact</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Stores with 3+ active AI employees maintain active daily inventory reconciliations with zero missed orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Safety & Approvals */}
      {activeTab === "safety" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-amber-400" />
              Safety Gates & Human Approvals
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Super Admin authorization inbox for high-impact growth actions, bulk communications, and partner outreach.
            </p>
          </div>

          {approvals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <CheckCircleIcon className="w-10 h-10 text-emerald-500/60" />
              <p className="text-sm">All operations cleared. No pending authorizations required.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((appr) => (
                <div
                  key={appr.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                          {appr.actionType}
                        </span>

                        {appr.actionType === "OUTBOUND_OUTREACH" && (
                          appr.proposedAction?.channel === "WHATSAPP" ? (
                            <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                              <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                              WhatsApp HSM Template
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold flex items-center gap-1">
                              <PaperAirplaneIcon className="w-3.5 h-3.5" />
                              Verified Email (SMTP)
                            </span>
                          )
                        )}

                        {appr.actionType === "PUBLISH_SOCIAL_POST" && (
                          <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold flex items-center gap-1">
                            <ShareIcon className="w-3.5 h-3.5" />
                            Live Social Media Feed
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white mt-1">{appr.title}</h4>
                      {appr.description && <p className="text-xs text-slate-300">{appr.description}</p>}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => handleResolveApproval(appr.id, "REJECTED")}
                        className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleResolveApproval(appr.id, "APPROVED")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Approve & Dispatch
                      </button>
                    </div>
                  </div>

                  {/* Contextual Proposal Details */}
                  {appr.proposedAction && (
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2.5">
                      {appr.actionType === "OUTBOUND_OUTREACH" && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-800/80 pb-2.5 text-slate-400">
                            <div>Target Business: <strong className="text-slate-200">{appr.proposedAction.businessName || "Merchant"}</strong></div>
                            <div>
                              Destination:{" "}
                              <strong className="text-indigo-300">
                                {appr.proposedAction.channel === "WHATSAPP"
                                  ? appr.proposedAction.recipientPhone || "Registered WhatsApp Phone"
                                  : appr.proposedAction.recipientEmail || "Registered Email"}
                              </strong>
                            </div>
                            <div>
                              Fallback: <span className="text-emerald-400 font-medium">Email Dispatch Auto-Failover</span>
                            </div>
                          </div>
                          {appr.proposedAction.body && (
                            <div className="space-y-1">
                              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Outreach Copy Preview:</span>
                              <div className="p-3 bg-slate-950 rounded-lg text-slate-200 font-mono text-[11px] whitespace-pre-wrap border border-slate-800">
                                {appr.proposedAction.body}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {appr.actionType === "PUBLISH_SOCIAL_POST" && (
                        <>
                          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 text-slate-400">
                            <span>Platforms:</span>
                            <div className="flex items-center gap-1.5">
                              {(appr.proposedAction.platforms || ["INSTAGRAM", "FACEBOOK"]).map((plat: string) => (
                                <span key={plat} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  {plat}
                                </span>
                              ))}
                            </div>
                          </div>
                          {appr.proposedAction.caption && (
                            <div className="space-y-1">
                              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Post Caption:</span>
                              <div className="p-3 bg-slate-950 rounded-lg text-slate-200 text-xs whitespace-pre-wrap border border-slate-800">
                                {appr.proposedAction.caption}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {appr.actionType !== "OUTBOUND_OUTREACH" && appr.actionType !== "PUBLISH_SOCIAL_POST" && (
                        <div className="font-mono text-[11px] text-slate-300 overflow-x-auto">
                          {JSON.stringify(appr.proposedAction, null, 2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Growth & Search APIs */}
      {activeTab === "apis" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <KeyIcon className="w-5 h-5 text-indigo-400" />
                External Growth, Search & Outbound APIs
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure commercial search keys (SerpApi & Google Custom Search) and Meta WhatsApp Cloud outreach credentials with live testing and instant template registration.
              </p>
            </div>
            <button
              onClick={fetchGrowthSettings}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors self-start md:self-auto"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${loadingSettings ? "animate-spin" : ""}`} />
              Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: SerpApi */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Local Merchant Scraper</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      growthSettings?.serpApi?.configured
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {growthSettings?.serpApi?.configured ? "🟢 CONFIGURED" : "🟡 MISSING KEY"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">SerpApi (Google Maps Engine)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Powers high-fidelity local merchant discovery for `searchPublicBusinesses`, pulling phone numbers, physical addresses, and ratings across Kenya.
                </p>

                <div className="p-3 bg-slate-950 rounded-xl text-xs space-y-1 text-slate-400">
                  <div>Source: <strong className="text-slate-200">{growthSettings?.serpApi?.source || "None"}</strong></div>
                  <div>Key: <strong className="font-mono text-slate-300">{growthSettings?.serpApi?.maskedKey || "Not set"}</strong></div>
                  <div>Status: <strong className="text-emerald-400">{growthSettings?.serpApi?.connectionStatus || "UNKNOWN"}</strong></div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setEditingTarget("SERPAPI");
                    setInputApiKey("");
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                >
                  Configure SerpApi Key
                </button>
                <button
                  onClick={() => handleTestSearch("SERPAPI")}
                  disabled={testingSearch || !growthSettings?.serpApi?.configured}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${testingSearch && testSearchProvider === "SERPAPI" ? "animate-spin" : ""}`} />
                  Test Live Scraper
                </button>
              </div>
            </div>

            {/* Card 2: Google Custom Search */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Web Directory Search</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      growthSettings?.googleSearch?.configured
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {growthSettings?.googleSearch?.configured ? "🟢 CONFIGURED" : "🟡 INCOMPLETE"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">Google Custom Search (CSE)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Web-wide business scraping fallback using Google Custom Search JSON API to index Kenyan e-commerce stores, Instagram pages, and merchant directories.
                </p>

                <div className="p-3 bg-slate-950 rounded-xl text-xs space-y-1 text-slate-400">
                  <div>Source: <strong className="text-slate-200">{growthSettings?.googleSearch?.source || "None"}</strong></div>
                  <div>Search Engine ID: <strong className="font-mono text-slate-300">{growthSettings?.googleSearch?.searchEngineId ? "Configured" : "Missing"}</strong></div>
                  <div>Status: <strong className="text-emerald-400">{growthSettings?.googleSearch?.connectionStatus || "UNKNOWN"}</strong></div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setEditingTarget("GOOGLE_SEARCH");
                    setInputApiKey("");
                    setInputCseId(growthSettings?.googleSearch?.searchEngineId || "");
                  }}
                  className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
                >
                  Configure Google CSE
                </button>
                <button
                  onClick={() => handleTestSearch("GOOGLE_SEARCH")}
                  disabled={testingSearch || !growthSettings?.googleSearch?.configured}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${testingSearch && testSearchProvider === "GOOGLE_SEARCH" ? "animate-spin" : ""}`} />
                  Test Live Google Search
                </button>
              </div>
            </div>

            {/* Card 3: Meta WhatsApp Outreach */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Outbound WhatsApp</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      growthSettings?.metaWhatsApp?.configured
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {growthSettings?.metaWhatsApp?.configured ? "🟢 ACTIVE" : "🟡 PENDING SETUP"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">Meta WhatsApp Cloud Outreach</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dispatches verified HSM templates to prospective merchants. Automatically falls back to verified email dispatch if phone delivery fails.
                </p>

                <div className="p-3 bg-slate-950 rounded-xl text-xs space-y-1 text-slate-400">
                  <div>HSM Template: <strong className="text-indigo-300 font-mono text-[11px]">{growthSettings?.metaWhatsApp?.templateName}</strong></div>
                  <div>Template Status: <strong className="text-emerald-400 font-semibold">{growthSettings?.metaWhatsApp?.templateStatus}</strong></div>
                  <div>WABA ID: <strong className="font-mono text-slate-300">{growthSettings?.metaWhatsApp?.wabaId || "Missing"}</strong></div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setEditingTarget("META_WHATSAPP");
                    setInputApiKey("");
                    setInputWabaId(growthSettings?.metaWhatsApp?.wabaId || "");
                    setInputPhoneId(growthSettings?.metaWhatsApp?.phoneNumberId || "");
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  Configure WhatsApp Credentials
                </button>
                <button
                  onClick={handleRegisterMetaTemplate}
                  disabled={registeringMetaTemplate || !growthSettings?.metaWhatsApp?.configured}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${registeringMetaTemplate ? "animate-spin" : ""}`} />
                  Register Outreach HSM Template
                </button>
              </div>
            </div>
          </div>

          {/* Test Search Results Live Feedback */}
          {searchTestResults && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  Live Search Verification Result ({searchTestResults.latencyMs}ms)
                </h4>
                <button
                  onClick={() => setSearchTestResults(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
              {searchTestResults.success ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {searchTestResults.sampleResults?.map((r: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-white">{r.businessName}</div>
                      {r.address && <div className="text-slate-400">{r.address}</div>}
                      {r.phone && <div className="text-emerald-400 font-mono">{r.phone}</div>}
                      {r.link && <div className="text-indigo-400 truncate">{r.link}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                  {searchTestResults.error}
                </div>
              )}
            </div>
          )}

          {/* Meta Template Registration Live Feedback */}
          {metaTemplateResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  Meta WhatsApp Template Registration Response
                </h4>
                <button
                  onClick={() => setMetaTemplateResult(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200">
                {JSON.stringify(metaTemplateResult, null, 2)}
              </div>
            </div>
          )}

          {/* Edit Credentials Modal */}
          {editingTarget && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
                <button
                  onClick={() => setEditingTarget(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-white"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Configure {editingTarget === "SERPAPI" ? "SerpApi" : editingTarget === "GOOGLE_SEARCH" ? "Google Custom Search" : "Meta WhatsApp"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Saved credentials will be encrypted at rest in the database and immediately used by all AI agents.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {editingTarget === "META_WHATSAPP" ? "Permanent Access Token" : "API Key"}
                    </label>
                    <input
                      type="password"
                      value={inputApiKey}
                      onChange={(e) => setInputApiKey(e.target.value)}
                      placeholder="Paste key / token here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  {editingTarget === "GOOGLE_SEARCH" && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Search Engine ID (cx)</label>
                      <input
                        type="text"
                        value={inputCseId}
                        onChange={(e) => setInputCseId(e.target.value)}
                        placeholder="e.g. 017576662512468239146:omuauf_lfve"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  )}

                  {editingTarget === "META_WHATSAPP" && (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp Business Account ID (WABA ID)</label>
                        <input
                          type="text"
                          value={inputWabaId}
                          onChange={(e) => setInputWabaId(e.target.value)}
                          placeholder="e.g. 109283746592817"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number ID</label>
                        <input
                          type="text"
                          value={inputPhoneId}
                          onChange={(e) => setInputPhoneId(e.target.value)}
                          placeholder="e.g. 102938475610293"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setEditingTarget(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveGrowthSettings(editingTarget)}
                    disabled={savingSettings || !inputApiKey.trim()}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingSettings ? "Encrypting & Saving..." : "Save Configuration"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Run Agent Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedAgent(null);
                setExecutionResult(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>

            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Run Workforce Agent
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{selectedAgent.name}</h3>
              <p className="text-xs text-slate-400">{selectedAgent.roleDescription}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Prompt / Task Instructions:</label>
              <textarea
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                placeholder="Enter prompt..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedAgent(null);
                  setExecutionResult(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRunAgent}
                disabled={executing || !taskPrompt.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Dispatch Task
                  </>
                )}
              </button>
            </div>

            {executionResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-emerald-400">Execution Succeeded</span>
                  <span>{executionResult.creditsUsed} cr</span>
                </div>
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {executionResult.reply}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Prospect Modal */}
      {showProspectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowProspectModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-white">Add Target Prospect</h3>

            <form onSubmit={handleCreateProspect} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Business Name:</label>
                <input
                  type="text"
                  required
                  value={newProspect.businessName}
                  onChange={(e) => setNewProspect({ ...newProspect, businessName: e.target.value })}
                  placeholder="e.g. Apex Hardware Supplies"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Category:</label>
                  <input
                    type="text"
                    required
                    value={newProspect.category}
                    onChange={(e) => setNewProspect({ ...newProspect, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Location:</label>
                  <input
                    type="text"
                    required
                    value={newProspect.location}
                    onChange={(e) => setNewProspect({ ...newProspect, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Email (Optional):</label>
                  <input
                    type="email"
                    value={newProspect.email}
                    onChange={(e) => setNewProspect({ ...newProspect, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Phone (Optional):</label>
                  <input
                    type="text"
                    value={newProspect.phone}
                    onChange={(e) => setNewProspect({ ...newProspect, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProspectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
