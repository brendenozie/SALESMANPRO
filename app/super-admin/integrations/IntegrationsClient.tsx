"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  KeyIcon,
  GlobeAltIcon,
  PlayIcon,
  CommandLineIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface IntegrationItem {
  id: string;
  provider: string;
  serviceName: string;
  category: string;
  scope: string;
  envVariables: string[];
  credentialTypes: string[];
  portalUrl: string;
  docUrl: string;
  accountType: string;
  prerequisites: Array<{ title: string; description: string }>;
  runtimeStatus: string;
  configuredVariables: Array<{
    key: string;
    exists: boolean;
    isConfigured: boolean;
    masked: string;
  }>;
  verificationProcedure: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  providerId: string;
  status: string;
  details?: any;
}

export default function IntegrationsClient() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Health check state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Supervised onboarding modal
  const [onboardingModal, setOnboardingModal] = useState<{
    open: boolean;
    provider: IntegrationItem | null;
    loading: boolean;
    message?: string;
  }>({ open: false, provider: null, loading: false });

  // Credential configuration modal
  const [configModal, setConfigModal] = useState<{
    open: boolean;
    provider: IntegrationItem | null;
    formValues: Record<string, string>;
    allowOverwrite: boolean;
    saving: boolean;
    feedback?: { success: boolean; message: string; changes?: any[] };
  }>({
    open: false,
    provider: null,
    formValues: {},
    allowOverwrite: false,
    saving: false,
  });

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/super-admin/integrations");
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations || []);
        setAuditLogs(data.recentAuditLogs || []);
        if (data.latestTestResults?.results) {
          const map: Record<string, any> = {};
          data.latestTestResults.results.forEach((r: any) => {
            map[r.providerId] = r;
          });
          setTestResults(map);
        }
      }
    } catch (err) {
      console.error("Failed to load integrations", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunHealthCheck = async (providerId: string) => {
    setTestingId(providerId);
    try {
      const res = await fetch("/api/super-admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_PROVIDER", providerId }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setTestResults((prev) => ({ ...prev, [providerId]: data.result }));
      }
    } catch (err) {
      console.error("Health check error", err);
    } finally {
      setTestingId(null);
    }
  };

  const handleRunAllHealthChecks = async () => {
    setTestingId("ALL");
    try {
      const res = await fetch("/api/super-admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_ALL" }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        const map: Record<string, any> = {};
        data.results.forEach((r: any) => {
          map[r.providerId] = r;
        });
        setTestResults(map);
      }
    } catch (err) {
      console.error("All checks error", err);
    } finally {
      setTestingId(null);
    }
  };

  const handleLaunchOnboarding = async (provider: IntegrationItem) => {
    setOnboardingModal({ open: true, provider, loading: true });
    try {
      const res = await fetch("/api/super-admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LAUNCH_SUPERVISED_ONBOARDING",
          providerId: provider.id,
        }),
      });
      const data = await res.json();
      setOnboardingModal({
        open: true,
        provider,
        loading: false,
        message: data.message || "Supervised browser launched.",
      });
    } catch (err: any) {
      setOnboardingModal({
        open: true,
        provider,
        loading: false,
        message: `Failed to launch browser: ${err.message}`,
      });
    }
  };

  const handleOpenConfigModal = (provider: IntegrationItem) => {
    const initialValues: Record<string, string> = {};
    provider.envVariables.forEach((k) => {
      initialValues[k] = "";
    });
    setConfigModal({
      open: true,
      provider,
      formValues: initialValues,
      allowOverwrite: false,
      saving: false,
    });
  };

  const handleSaveCredentials = async () => {
    if (!configModal.provider) return;
    setConfigModal((prev) => ({ ...prev, saving: true, feedback: undefined }));
    try {
      // Filter out empty entries
      const cleanUpdates: Record<string, string> = {};
      Object.entries(configModal.formValues).forEach(([k, v]) => {
        if (v && v.trim().length > 0) {
          cleanUpdates[k] = v.trim();
        }
      });

      if (Object.keys(cleanUpdates).length === 0) {
        setConfigModal((prev) => ({
          ...prev,
          saving: false,
          feedback: { success: false, message: "Please enter at least one credential value." },
        }));
        return;
      }

      const res = await fetch("/api/super-admin/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STAGE_CREDENTIALS",
          providerId: configModal.provider.id,
          credentials: cleanUpdates,
          allowOverwrite: configModal.allowOverwrite,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigModal((prev) => ({
          ...prev,
          saving: false,
          feedback: { success: true, message: data.message, changes: data.changes },
        }));
        fetchData();
      } else {
        setConfigModal((prev) => ({
          ...prev,
          saving: false,
          feedback: { success: false, message: data.error || "Failed to commit credentials." },
        }));
      }
    } catch (err: any) {
      setConfigModal((prev) => ({
        ...prev,
        saving: false,
        feedback: { success: false, message: err.message },
      }));
    }
  };

  // Filtered integrations
  const categories = [
    { key: "ALL", label: "All Integrations" },
    { key: "AI_INFRASTRUCTURE", label: "AI Infrastructure" },
    { key: "META_WHATSAPP", label: "Meta & WhatsApp" },
    { key: "PAYMENTS", label: "Payments & Settlement" },
    { key: "SOCIAL_PLATFORMS", label: "Social Networks" },
    { key: "AUTHENTICATION", label: "Identity & SSO" },
    { key: "COMMUNICATIONS", label: "Email & SMS" },
    { key: "STORAGE_CDN", label: "S3 & Backups" },
    { key: "INFRASTRUCTURE_OPS", label: "Core Infra" },
  ];

  const filteredIntegrations = integrations.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.envVariables.some((v) => v.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalCount = integrations.length;
  const configuredCount = integrations.filter((i) => i.runtimeStatus === "CONFIGURED" || i.runtimeStatus === "VERIFIED").length;
  const attentionCount = totalCount - configuredCount;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Zero-Trust Vault Active
            </span>
            <span className="text-xs text-slate-400">Playwright-Assisted Registration & Audit</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Integrations & API Credential Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Register, configure, cryptographically verify, and deploy platform-wide API credentials.
            All secret keys remain masked and protected against leakage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-slate-300 transition-all"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunAllHealthChecks}
            disabled={testingId !== null}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-amber-500/20 transition-all"
          >
            <CommandLineIcon className="h-4 w-4" />
            <span>{testingId === "ALL" ? "Testing All..." : "Run All Health Checks"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Integrations</div>
            <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <GlobeAltIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configured Locally</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{configuredCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircleIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action / Registration Required</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{attentionCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Cipher</div>
            <div className="text-base font-black text-white mt-1">AES-256-GCM</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search provider, env var, scope..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Integrations Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading integration registry...</p>
        </div>
      ) : filteredIntegrations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/20 border border-slate-800 text-slate-500">
          <p className="text-sm font-semibold">No integrations found matching your query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIntegrations.map((item) => {
            const isExpanded = expandedId === item.id;
            const testResult = testResults[item.id];
            const isCurrentlyTesting = testingId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden transition-all hover:border-slate-700/80"
              >
                {/* Header row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400 shrink-0 border border-slate-700">
                      <KeyIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">{item.serviceName}</h3>
                        <span className="text-xs text-slate-400">({item.provider})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {item.scope}
                        </span>
                        {item.runtimeStatus === "CONFIGURED" || item.runtimeStatus === "VERIFIED" ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircleIcon className="h-3 w-3" /> Configured
                          </span>
                        ) : item.runtimeStatus === "CONFIGURED_PARTIAL" ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Partial Config
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Registration Needed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                        <span>Account: {item.accountType}</span>
                        <span>•</span>
                        <span>Variables: {item.envVariables.join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRunHealthCheck(item.id)}
                      disabled={isCurrentlyTesting}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      <ArrowPathIcon className={`h-3.5 w-3.5 ${isCurrentlyTesting ? "animate-spin" : ""}`} />
                      <span>{isCurrentlyTesting ? "Testing..." : "Health Check"}</span>
                    </button>

                    <button
                      onClick={() => handleLaunchOnboarding(item)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
                    >
                      <PlayIcon className="h-3.5 w-3.5" />
                      <span>Playwright Assist</span>
                    </button>

                    <button
                      onClick={() => handleOpenConfigModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <LockClosedIcon className="h-3.5 w-3.5" />
                      <span>Configure</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/50"
                    >
                      {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Health Check Result Banner */}
                {testResult && (
                  <div
                    className={`mx-5 mb-4 p-3 rounded-xl text-xs flex items-center justify-between border ${
                      testResult.success
                        ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                        : "bg-rose-950/40 border-rose-800/60 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-rose-400" />
                      )}
                      <span>
                        <strong>Status [{testResult.credentialStatus}]:</strong> {testResult.message}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(testResult.testedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-slate-800 p-5 bg-slate-950/40 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Environment Variables & Masked Values */}
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Environment Variables & Status
                        </h4>
                        <div className="space-y-2">
                          {item.configuredVariables.map((cv) => (
                            <div
                              key={cv.key}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                            >
                              <span className="font-mono text-amber-400 font-bold">{cv.key}</span>
                              <span className="font-mono text-slate-400 text-[11px]">{cv.masked}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Prerequisites & Official Portals */}
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Official Portals & Documentation
                        </h4>
                        <div className="flex items-center gap-3">
                          <a
                            href={item.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-400 border border-slate-700 flex items-center gap-1.5 transition-all"
                          >
                            <span>Open Developer Portal</span>
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={item.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                          >
                            <span>Official Documentation</span>
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        <div className="pt-2">
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Setup Prerequisites:
                          </h5>
                          <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                            {item.prerequisites.map((p, idx) => (
                              <li key={idx}>
                                <strong>{p.title}:</strong> {p.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                      <strong>Automated Verification Procedure:</strong> {item.verificationProcedure}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Supervised Onboarding Assistance Modal */}
      {onboardingModal.open && onboardingModal.provider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <PlayIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Supervised Onboarding: {onboardingModal.provider.serviceName}
                  </h3>
                  <p className="text-xs text-slate-400">Playwright Isolated Browser Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setOnboardingModal({ open: false, provider: null, loading: false })}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {onboardingModal.loading ? (
              <div className="py-8 text-center space-y-3">
                <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-indigo-400" />
                <p className="text-xs text-slate-300">Launching secure, isolated browser session...</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-slate-300">
                <p className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300">
                  {onboardingModal.message}
                </p>
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Workflow Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                    <li>A supervised browser window opens to the official provider portal.</li>
                    <li>You complete your developer login, 2FA, or CAPTCHA manually.</li>
                    <li>Generate or locate the API credentials requested for this service.</li>
                    <li>Copy credentials safely into the SalesmanPro credential entry vault.</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setOnboardingModal({ open: false, provider: null, loading: false })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Staging & Vault Entry Modal */}
      {configModal.open && configModal.provider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Configure Credentials: {configModal.provider.serviceName}
                  </h3>
                  <p className="text-xs text-slate-400">Zero-Leakage Local Vault Staging</p>
                </div>
              </div>
              <button
                onClick={() => setConfigModal({ open: false, provider: null, formValues: {}, allowOverwrite: false, saving: false })}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {configModal.feedback && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  configModal.feedback.success
                    ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                    : "bg-rose-950/40 border-rose-800 text-rose-300"
                }`}
              >
                {configModal.feedback.message}
              </div>
            )}

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {configModal.provider.envVariables.map((variableKey) => (
                <div key={variableKey} className="space-y-1">
                  <label className="text-xs font-mono font-bold text-amber-400">{variableKey}</label>
                  <input
                    type="password"
                    placeholder={`Enter ${variableKey} value...`}
                    value={configModal.formValues[variableKey] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfigModal((prev) => ({
                        ...prev,
                        formValues: { ...prev.formValues, [variableKey]: val },
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowOverwriteCheck"
                  checked={configModal.allowOverwrite}
                  onChange={(e) =>
                    setConfigModal((prev) => ({
                      ...prev,
                      allowOverwrite: e.target.checked,
                    }))
                  }
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="allowOverwriteCheck" className="text-xs text-slate-400 select-none">
                  Allow overwriting existing configured values (an automatic backup is always created)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Values are saved atomically to .env with automated timestamped backup.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfigModal({ open: false, provider: null, formValues: {}, allowOverwrite: false, saving: false })}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCredentials}
                  disabled={configModal.saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20"
                >
                  {configModal.saving ? "Staging..." : "Commit Credentials"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Stream Section */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CommandLineIcon className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Credential Lifecycle Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-500">Append-Only Event Stream</span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-500">No audit events recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      log.status === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="font-bold text-white">{log.providerId}</span>
                  {log.details?.message && (
                    <span className="text-slate-400 text-[11px] truncate max-w-md">
                      {log.details.message}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
