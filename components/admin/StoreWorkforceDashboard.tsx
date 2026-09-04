"use client";

import React, { useState, useEffect } from "react";
import {
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ClockIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  QueueListIcon,
  PlayIcon,
  PaperAirplaneIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface Agent {
  key: string;
  name: string;
  level: string;
  roleDescription: string;
  systemPrompt: string;
  currentPermission: string;
  enabled: boolean;
  allowedTools: string[];
  currentDailyCreditLimit: number;
  badge?: string;
  icon?: string;
  exampleQueries?: string[];
  totalTasksExecuted: number;
  totalCreditsConsumed: number;
}

interface TaskExecution {
  id: string;
  title: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
  agent: {
    key: string;
    name: string;
  };
}

interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  actionType: string;
  proposedAction: any;
  status: string;
  createdAt: string;
  agent?: {
    name: string;
  };
}

interface Metrics {
  totalTasks: number;
  completedTasks: number;
  pendingApprovals: number;
  runningTasks: number;
  failedTasks: number;
  activeAgents: number;
  creditBalance: number;
  totalCreditsUsed: number;
  estimatedHoursSaved: number;
  successRatePercentage: number;
}

export default function StoreWorkforceDashboard({ companySlug }: { companySlug: string }) {
  const [activeTab, setActiveTab] = useState<"roster" | "briefing" | "approvals" | "escalations" | "activity">("roster");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskExecution[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [resolvingEscalationId, setResolvingEscalationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [taskPrompt, setTaskPrompt] = useState("");
  const [runningTask, setRunningTask] = useState(false);
  const [taskResult, setTaskResult] = useState<any>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [generatingBriefing, setGeneratingBriefing] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [agentsRes, metricsRes, approvalsRes, escalationsRes] = await Promise.all([
        fetch("/api/ai/workforce/agents?level=STORE"),
        fetch("/api/ai/workforce/metrics"),
        fetch("/api/ai/workforce/approvals?status=PENDING"),
        fetch("/api/ai/workforce/escalations?status=PENDING"),
      ]);

      const [agentsData, metricsData, approvalsData, escalationsData] = await Promise.all([
        agentsRes.json(),
        metricsRes.json(),
        approvalsRes.json(),
        escalationsRes.json(),
      ]);

      if (agentsData.success) setAgents(agentsData.agents || []);
      if (metricsData.success) {
        setMetrics(metricsData.metrics);
        setRecentTasks(metricsData.recentTasks || []);
      }
      if (approvalsData.success) setPendingApprovals(approvalsData.approvals || []);
      if (escalationsData.success) setEscalations(escalationsData.escalations || []);
    } catch (err) {
      console.error("Failed to load workforce data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveEscalation = async (id: string) => {
    try {
      setResolvingEscalationId(id);
      const res = await fetch(`/api/ai/workforce/escalations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      const data = await res.json();
      if (data.success) {
        setEscalations((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Failed to resolve escalation", err);
    } finally {
      setResolvingEscalationId(null);
    }
  };

  // Run or assign a task to an agent
  const handleRunTask = async (agentKey: string, promptText: string) => {
    if (!promptText.trim()) return;
    setRunningTask(true);
    setTaskResult(null);
    try {
      const res = await fetch("/api/ai/workforce/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentKey,
          prompt: promptText,
          channel: "WEB",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTaskResult(data.result);
        setTaskPrompt("");
        fetchData(); // Refresh metrics & tasks
      } else {
        alert(data.error || "Failed to execute agent task");
      }
    } catch (err: any) {
      alert("Execution error: " + err.message);
    } finally {
      setRunningTask(false);
    }
  };

  // Generate Today's Store Briefing
  const handleGenerateBriefing = async () => {
    setGeneratingBriefing(true);
    try {
      const res = await fetch("/api/ai/workforce/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentKey: "STORE_MANAGER",
          prompt: "Generate my comprehensive store operational briefing for today. Include stock warnings, sales trends, pending customer inquiries, and 3 high-priority recommendations.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBriefing(data.result.reply);
      } else {
        alert(data.error || "Failed to generate briefing");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setGeneratingBriefing(false);
    }
  };

  // Approve or Reject proposed action
  const handleResolveApproval = async (approvalId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/ai/workforce/approvals/${approvalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingApprovals((prev) => prev.filter((item) => item.id !== approvalId));
        fetchData();
      } else {
        alert(data.error || "Failed to update approval");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Toggle agent active status
  const handleToggleAgent = async (agentKey: string, currentEnabled: boolean) => {
    try {
      const res = await fetch("/api/ai/workforce/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: agentKey,
          enabled: !currentEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAgents((prev) =>
          prev.map((a) => (a.key === agentKey ? { ...a, enabled: !currentEnabled } : a)),
        );
      }
    } catch (err) {
      console.error("Failed to toggle agent", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Store Workforce
            </span>
            <span className="text-xs text-slate-400">Level 1 Multi-Tenant AI</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BuildingStorefrontIcon className="w-8 h-8 text-emerald-400" />
            My AI Workforce
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your specialized team of 13 autonomous AI employees managing sales, inventory, support, and marketing.
          </p>
        </div>

        {/* Top KPI Cards */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
            <BoltIcon className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs text-slate-400">AI Credit Balance</div>
              <div className="text-lg font-bold text-white">
                {metrics?.creditBalance?.toLocaleString() || "0"}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
            <ClockIcon className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-xs text-slate-400">Time Saved</div>
              <div className="text-lg font-bold text-white">
                ~{metrics?.estimatedHoursSaved || 0} hrs
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
            <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs text-slate-400">Success Rate</div>
              <div className="text-lg font-bold text-white">
                {metrics?.successRatePercentage || 100}%
              </div>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("roster")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "roster"
              ? "border-emerald-400 text-emerald-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserGroupIcon className="w-4 h-4" />
          AI Employees ({agents.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("briefing");
            if (!briefing && !generatingBriefing) handleGenerateBriefing();
          }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "briefing"
              ? "border-emerald-400 text-emerald-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          Daily Store Briefing
        </button>

        <button
          onClick={() => setActiveTab("approvals")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors relative ${
            activeTab === "approvals"
              ? "border-emerald-400 text-emerald-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          Approvals Required
          {pendingApprovals.length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 text-xs rounded-full">
              {pendingApprovals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("escalations")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors relative ${
            activeTab === "escalations"
              ? "border-emerald-400 text-emerald-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          Customer Escalations
          {escalations.length > 0 && (
            <span className="bg-rose-500 text-white font-bold px-1.5 py-0.2 text-xs rounded-full">
              {escalations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "activity"
              ? "border-emerald-400 text-emerald-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <QueueListIcon className="w-4 h-4" />
          Activity & Telemetry
        </button>
      </div>

      {/* Tab 1: AI Employees Roster */}
      {activeTab === "roster" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => (
              <div
                key={agent.key}
                className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-slate-700 shadow-lg ${
                  agent.enabled ? "border-slate-800" : "border-slate-800/50 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {agent.badge || "Agent"}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1.5">{agent.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAgent(agent.key, agent.enabled)}
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                          agent.enabled ? "bg-emerald-500" : "bg-slate-700"
                        }`}
                        title={agent.enabled ? "Disable Agent" : "Enable Agent"}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            agent.enabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {agent.roleDescription}
                  </p>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Permission Level:</span>
                      <span className="font-semibold text-emerald-400">{agent.currentPermission}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Daily Budget:</span>
                      <span className="text-slate-200">{agent.currentDailyCreditLimit} credits</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Tasks Completed:</span>
                      <span className="text-slate-200">{agent.totalTasksExecuted}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAgent(agent);
                      setTaskPrompt(agent.exampleQueries?.[0] || "");
                      setTaskResult(null);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/20"
                  >
                    <PlayIcon className="w-3.5 h-3.5" />
                    Assign Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Daily Briefing */}
      {activeTab === "briefing" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-400" />
                AI Store Manager Daily Briefing
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative real-time synthesis of catalog, orders, stockout risks, and customer trends.
              </p>
            </div>
            <button
              onClick={handleGenerateBriefing}
              disabled={generatingBriefing}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${generatingBriefing ? "animate-spin" : ""}`} />
              {generatingBriefing ? "Synthesizing Store Data..." : "Regenerate Briefing"}
            </button>
          </div>

          {generatingBriefing ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm">Auditing inventory, orders, and sales trends...</p>
            </div>
          ) : briefing ? (
            <div className="prose prose-invert max-w-none text-slate-200 text-sm whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-6 rounded-xl border border-slate-800/80">
              {briefing}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Click &quot;Regenerate Briefing&quot; to have your AI Store Manager audit your live store metrics.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Approvals Required */}
      {activeTab === "approvals" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-amber-400" />
              Human-in-the-Loop Approval Center
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-impact agent proposals (outbound communications, store discounts, campaign launches) require your authorization.
            </p>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <CheckCircleIcon className="w-10 h-10 text-emerald-500/60" />
              <p className="text-sm">No pending approvals. Your AI workforce is running smoothly within authorized parameters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        {approval.actionType}
                      </span>
                      {approval.actionType === "PUBLISH_SOCIAL_POST" && (
                        <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold flex items-center gap-1">
                          <ShareIcon className="w-3.5 h-3.5" />
                          Social Media Direct Feed
                        </span>
                      )}
                      {approval.actionType === "OUTBOUND_OUTREACH" && (
                        approval.proposedAction?.channel === "WHATSAPP" ? (
                          <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                            WhatsApp HSM Outreach
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold flex items-center gap-1">
                            <PaperAirplaneIcon className="w-3.5 h-3.5" />
                            Verified Email Pitch
                          </span>
                        )
                      )}
                      <span className="text-xs text-slate-400">
                        Requested by: <strong className="text-slate-200">{approval.agent?.name || "Agent"}</strong>
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{approval.title}</h4>
                    {approval.description && (
                      <p className="text-xs text-slate-300">{approval.description}</p>
                    )}

                    {approval.proposedAction && (
                      <div className="mt-2 p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-2">
                        {approval.actionType === "PUBLISH_SOCIAL_POST" && (
                          <>
                            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                              <span>Destination Platforms:</span>
                              <div className="flex items-center gap-1.5">
                                {(approval.proposedAction.platforms || ["INSTAGRAM", "FACEBOOK"]).map((plat: string) => (
                                  <span key={plat} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {plat}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {approval.proposedAction.caption && (
                              <div className="p-3 bg-slate-950 rounded-lg text-slate-200 text-xs whitespace-pre-wrap border border-slate-800">
                                {approval.proposedAction.caption}
                              </div>
                            )}
                          </>
                        )}

                        {approval.actionType === "OUTBOUND_OUTREACH" && (
                          <>
                            <div className="text-slate-400 text-[11px]">
                              Target: <strong className="text-slate-200">{approval.proposedAction.businessName}</strong> ({approval.proposedAction.recipientPhone || approval.proposedAction.recipientEmail})
                            </div>
                            {approval.proposedAction.body && (
                              <div className="p-3 bg-slate-950 rounded-lg text-slate-200 font-mono text-[11px] whitespace-pre-wrap border border-slate-800">
                                {approval.proposedAction.body}
                              </div>
                            )}
                          </>
                        )}

                        {approval.actionType !== "PUBLISH_SOCIAL_POST" && approval.actionType !== "OUTBOUND_OUTREACH" && (
                          <div className="font-mono text-[11px] text-slate-300 overflow-x-auto max-h-32">
                            {JSON.stringify(approval.proposedAction, null, 2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleResolveApproval(approval.id, "REJECTED")}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleResolveApproval(approval.id, "APPROVED")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Approve & Execute
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Customer Escalations */}
      {activeTab === "escalations" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-rose-400" />
              WhatsApp Customer Human Escalation Queue
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Conversations where customers requested human assistance or complex issues requiring store staff intervention.
            </p>
          </div>

          {escalations.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
              <h3 className="text-sm font-semibold text-white">Zero Pending Escalations</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All customer WhatsApp inquiries are currently being handled smoothly by your AI Support and Sales agents.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {escalations.map((esc) => (
                <div
                  key={esc.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-700"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {esc.priority || "HIGH"} PRIORITY
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(esc.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white">
                      Customer Phone: <span className="text-emerald-400">{esc.customerPhone || "Not specified"}</span>
                      {esc.customerEmail && <span className="text-slate-400 ml-2">({esc.customerEmail})</span>}
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <strong>Escalation Reason:</strong> {esc.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {esc.customerPhone && (
                      <a
                        href={`https://wa.me/${esc.customerPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        Open WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => handleResolveEscalation(esc.id)}
                      disabled={resolvingEscalationId === esc.id}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                      {resolvingEscalationId === esc.id ? "Resolving..." : "Mark Resolved"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Activity & Telemetry */}
      {activeTab === "activity" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <QueueListIcon className="w-5 h-5 text-indigo-400" />
              Workforce Activity & Execution Log
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable audit trails, tool calls, and credit accounting across your store agents.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-white">{t.title}</td>
                    <td className="py-3 px-4 text-slate-400">{t.agent?.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : t.status === "RUNNING"
                            ? "bg-blue-500/10 text-blue-400"
                            : t.status === "WAITING_APPROVAL"
                            ? "bg-amber-500/10 text-amber-400"
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

      {/* Task Assignment Modal Drawer */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedAgent(null);
                setTaskResult(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>

            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Assign Task
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{selectedAgent.name}</h3>
              <p className="text-xs text-slate-400">{selectedAgent.roleDescription}</p>
            </div>

            {/* Example Queries */}
            {selectedAgent.exampleQueries && (
              <div>
                <span className="text-xs text-slate-400">Suggested tasks:</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {selectedAgent.exampleQueries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTaskPrompt(q)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Prompt / Task Instructions:</label>
              <textarea
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                placeholder={`Ask ${selectedAgent.name} to perform a task...`}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedAgent(null);
                  setTaskResult(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRunTask(selectedAgent.key, taskPrompt)}
                disabled={runningTask || !taskPrompt.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {runningTask ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Execute Task
                  </>
                )}
              </button>
            </div>

            {/* Execution Result */}
            {taskResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-emerald-400">Task Completed</span>
                  <span>{taskResult.creditsUsed} credits consumed</span>
                </div>
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {taskResult.reply}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
