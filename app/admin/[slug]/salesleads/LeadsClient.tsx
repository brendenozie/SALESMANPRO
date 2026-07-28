"use client";

import {
  PauseIcon,
  PlayIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  SparklesIcon,
  BeakerIcon,
  UserGroupIcon,
  SpeakerWaveIcon,
  CheckIcon,
  QueueListIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";

type ScriptVersion = "A" | "B" | "C" | "D";
const SCRIPT_VERSIONS: ScriptVersion[] = ["A", "B", "C", "D"];

interface Lead {
  id: string;
  name?: string;
  businessName?: string;
  phone: string;
  email?: string;
  businessType?: string;
  stage: string;
  automationStatus?: "sent" | "pending" | "failed";
  scriptVersion?: ScriptVersion;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function LeadsClient({
  initialLeads = [],
  initialPagination = { total: 0, page: 1, limit: 10, totalPages: 1 },
  companyId,
}: {
  initialLeads: Lead[];
  initialPagination?: PaginationMeta;
  companyId: string;
}) {
  // Core Data States
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState("cold");
  const [activeScript, setActiveScript] = useState<ScriptVersion>("A");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Automation Engine States
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [isSmartPausing, setIsSmartPausing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>("Engine Ready");
  const [timeLeft, setTimeLeft] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [currentProcessingId, setCurrentProcessingId] = useState<string | null>(null);
  const [maxCooldown, setMaxCooldown] = useState(1);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(initialPagination.page || 1);
  const [pageSize, setPageSize] = useState(initialPagination.limit || 10);

  // Modal States
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    businessType: "",
  });

  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [isSubmittingConvert, setIsSubmittingConvert] = useState(false);
  const [convertForm, setConvertForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    notes: "",
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoRunningRef = useRef(false);

  const DAILY_MAX = 50;
  const BATCH_SIZE = 10;
  const SMART_PAUSE_DURATION = 900; // 15 mins

  const scripts: Record<ScriptVersion, string> = {
    A: "Sasa! 👋 Hope biashara is good today. Quick question, how are you interacting with customer orders, manually? in the DMs? I help local businesses set up instant, affordable websites in under an hour so customers can view your catalog and order directly. Mind if I send a quick 10-second demo video?",
    B: "Hi there 👋 Hope uko poa! Quick one, do you already have a website for your work? I build clean, super affordable sites for businesses and have them live in less than 60 minutes. Would you be opposed to checking out a quick sample link?",
    C: "Hey! 👋 Hope business is moving well. I’m helping local hustles get simple, professional websites up and running super fast (under an hour) for a very friendly budget. Is getting a website something you've been looking to do for your business recently?",
    D: "Sasa 👋 Hope day iko sawa! Quick one, if you don't have a website yet, I can build and launch one for your business today in less than an hour, without breaking the bank. Can I drop a quick 15-second screen recording showing how it works?",
  };

  const stages = [
    { id: "cold", label: "Discovery", icon: UserGroupIcon },
    { id: "replied", label: "Engaged", icon: SparklesIcon },
    { id: "interested", label: "Warm", icon: BeakerIcon },
    { id: "paid", label: "Converted", icon: CheckCircleIcon },
  ];

  // Fetch leads from server API
  const fetchLeads = async (
    page = currentPage,
    limit = pageSize,
    stage = activeStage,
    search = searchQuery
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        companyId,
        stage,
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLeads(json.data?.leads || []);
        if (json.data?.pagination) {
          setPagination(json.data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Stage Switch Handler
  const handleStageChange = (stageId: string) => {
    setActiveStage(stageId);
    setCurrentPage(1);
    setSelectedLeads([]);
    fetchLeads(1, pageSize, stageId, searchQuery);
  };

  // Pagination Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
    setSelectedLeads([]);
    fetchLeads(newPage, pageSize, activeStage, searchQuery);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setSelectedLeads([]);
    fetchLeads(1, newSize, activeStage, searchQuery);
  };

  // Search Submit Handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSelectedLeads([]);
    fetchLeads(1, pageSize, activeStage, searchQuery);
  };

  const formatMessage = (template: string, lead: Lead) => {
    const bName = lead.businessName || lead.name || "your business";
    return template.replace(/{{businessName}}/g, bName);
  };

  const playNotification = () => {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
    );
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const waitWithCountdown = (seconds: number) => {
    return new Promise((resolve) => {
      setTimeLeft(seconds);
      setMaxCooldown(seconds);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            resolve(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });
  };

  const startEngine = async () => {
    const queue =
      selectedLeads.length > 0
        ? leads.filter((l) => selectedLeads.includes(l.id))
        : leads.filter((l) => l.automationStatus !== "sent");

    if (queue.length === 0) {
      return alert("No valid leads left in queue to process!");
    }

    setIsAutoRunning(true);
    isAutoRunningRef.current = true;

    let scriptIndex = SCRIPT_VERSIONS.indexOf(activeScript);
    if (scriptIndex === -1) scriptIndex = 0;

    for (const lead of queue) {
      if (!isAutoRunningRef.current || dailyCount >= DAILY_MAX) break;

      const currentVersion = SCRIPT_VERSIONS[scriptIndex];
      setActiveScript(currentVersion);

      if (batchCount > 0 && batchCount % BATCH_SIZE === 0) {
        setIsSmartPausing(true);
        setCurrentAction("Human Break Simulation");
        await waitWithCountdown(SMART_PAUSE_DURATION);
        if (!isAutoRunningRef.current) break;
        playNotification();
        setIsSmartPausing(false);
        setBatchCount(0);
      }

      setCurrentProcessingId(lead.id);
      setCurrentAction(
        `Messaging ${lead.businessName || lead.name || lead.phone} (V-${currentVersion})...`
      );

      const success = await sendWhatsApp(lead.id, currentVersion);

      if (success) {
        setDailyCount((prev) => prev + 1);
        setBatchCount((prev) => prev + 1);
        scriptIndex = (scriptIndex + 1) % SCRIPT_VERSIONS.length;

        setIsCoolingDown(true);
        setCurrentAction("Cooldown Interval");
        const cooldown = Math.floor(Math.random() * (90 - 45 + 1) + 45);
        await waitWithCountdown(cooldown);
        if (!isAutoRunningRef.current) break;
        setIsCoolingDown(false);
      }
    }

    stopEngine();
  };

  const stopEngine = () => {
    isAutoRunningRef.current = false;
    setIsAutoRunning(false);
    setIsCoolingDown(false);
    setIsSmartPausing(false);
    setCurrentProcessingId(null);
    setCurrentAction("Engine Ready");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const sendWhatsApp = async (leadId: string, version: ScriptVersion) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return false;

    const message = scripts[version];
    const personalizedMessage = formatMessage(message, lead);
    const cleanPhone = lead.phone.replace(/\D/g, "");

    const waUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(
      personalizedMessage
    )}&type=phone_number&app_absent=0`;
    window.open(waUrl, "_blank");

    try {
      const res = await fetch("/api/admin/leads/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, scriptVersion: version }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId
              ? { ...l, automationStatus: "sent", scriptVersion: version }
              : l
          )
        );
        return true;
      }
    } catch (err) {
      return false;
    }
    return false;
  };

  // Create Lead Handler
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.phone) return alert("Phone number is required");

    setIsSubmittingLead(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLeadForm,
          companyId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setIsAddLeadOpen(false);
        setNewLeadForm({ name: "", phone: "", email: "", businessType: "" });
        fetchLeads(currentPage, pageSize, activeStage, searchQuery);
      } else {
        alert(data.message || "Failed to add lead");
      }
    } catch (error) {
      alert("Error adding lead");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Convert Modal Handlers
  const openConvertModal = (lead: Lead) => {
    setConvertingLead(lead);
    setConvertForm({
      name: lead.name || lead.businessName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      password: "",
      notes: `Converted from lead (${lead.phone})`,
    });
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead || !convertForm.email) {
      return alert("Email address is required for consumer account creation");
    }

    setIsSubmittingConvert(true);
    try {
      const res = await fetch("/api/admin/leads/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: convertingLead.id,
          companyId,
          ...convertForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setConvertingLead(null);
        alert("Lead successfully onboarded into Consumer Profile!");
        fetchLeads(currentPage, pageSize, activeStage, searchQuery);
      } else {
        alert(data.message || "Failed to convert lead");
      }
    } catch (error) {
      alert("Error converting lead to consumer profile");
    } finally {
      setIsSubmittingConvert(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  const pendingLeadsCount = leads.filter(
    (l) => l.automationStatus !== "sent"
  ).length;

  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = Math.min(startIndex + leads.length, pagination.total);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-400 font-sans pb-28">
      {/* Header Bar */}
      <nav className="border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-tight text-base sm:text-lg">
              WhatsApp Outreach Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddLeadOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>Add Lead</span>
            </button>

            <button
              onClick={() => fetchLeads()}
              disabled={isLoading}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Refresh Data"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-400" : ""}`}
              />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAutoRunning ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
                }`}
              />
              <SpeakerWaveIcon
                className={`w-3.5 h-3.5 ${
                  isAutoRunning ? "text-emerald-400" : "text-zinc-500"
                }`}
              />
              <span className="hidden sm:inline text-zinc-300">
                {isAutoRunning ? "Engine Active" : "Engine Ready"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-6 sticky top-22 h-[calc(100vh-120px)]">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3 space-y-1">
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Pipeline Stages
            </p>
            {stages.map((stage) => {
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-medium"
                      : "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <stage.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{stage.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Daily Quota Progress Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-zinc-400">
                Daily Messaging Limit
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {dailyCount} / {DAILY_MAX}
              </span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
              <div
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{
                  width: `${Math.min((dailyCount / DAILY_MAX) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </aside>

        {/* Mobile Horizontal Stage Bar */}
        <div className="lg:hidden overflow-x-auto flex gap-2 pb-2 scrollbar-none sticky top-16 bg-[#09090b]/95 backdrop-blur-md z-20 py-2 -mx-4 px-4 border-b border-zinc-800/80">
          {stages.map((stage) => {
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleStageChange(stage.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                }`}
              >
                <stage.icon className="w-4 h-4" />
                <span>{stage.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Lead Table Section */}
        <section className="flex-1 bg-zinc-900/20 border border-zinc-800/60 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between">
          <div>
            {/* Top Filter & Toolbar Bar */}
            <div className="p-4 sm:p-5 border-b border-zinc-800/60 bg-zinc-900/40 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="p-2 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Select All Current Page Leads"
                >
                  <QueueListIcon className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-white capitalize">
                    {activeStage} Leads
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {pendingLeadsCount} unsent in current view
                  </p>
                </div>
              </div>

              {/* Search Bar & Script Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative w-full sm:w-60"
                >
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </form>

                {/* Script Variant Selector */}
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 w-full sm:w-auto justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2">
                    Script:
                  </span>
                  {SCRIPT_VERSIONS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setActiveScript(v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeScript === v
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      V-{v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Script Template Preview Box */}
            <div className="p-3.5 bg-indigo-950/20 border-b border-indigo-900/20 px-5 flex items-start gap-3">
              <SparklesIcon className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-indigo-200/80 italic leading-relaxed line-clamp-2">
                "{scripts[activeScript]}"
              </p>
            </div>

            {/* Selected Leads Banner */}
            {selectedLeads.length > 0 && (
              <div className="bg-indigo-900/30 border-b border-indigo-800/50 px-5 py-2.5 flex items-center justify-between text-xs text-indigo-200">
                <span>
                  <strong>{selectedLeads.length}</strong> lead(s) selected
                </span>
                <button
                  onClick={() => setSelectedLeads([])}
                  className="text-xs underline text-indigo-300 hover:text-white cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* Leads List Body */}
            <div className="divide-y divide-zinc-800/40 overflow-y-auto max-h-[calc(100vh-380px)]">
              {isLoading ? (
                <div className="p-12 text-center text-zinc-500">
                  <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  <p className="text-xs">Loading leads...</p>
                </div>
              ) : leads.length === 0 ? (
                <div className="p-12 text-center text-zinc-600">
                  <p className="text-sm">No leads found in this pipeline stage.</p>
                </div>
              ) : (
                leads.map((lead) => {
                  const isProcessing = currentProcessingId === lead.id;
                  const isSelected = selectedLeads.includes(lead.id);

                  return (
                    <div
                      key={lead.id}
                      className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-all ${
                        isProcessing
                          ? "bg-indigo-500/10 border-l-4 border-l-indigo-500"
                          : isSelected
                          ? "bg-zinc-800/30"
                          : "hover:bg-zinc-900/30 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            setSelectedLeads((prev) =>
                              prev.includes(lead.id)
                                ? prev.filter((i) => i !== lead.id)
                                : [...prev, lead.id]
                            )
                          }
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="truncate">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              isProcessing ? "text-indigo-300" : "text-zinc-200"
                            }`}
                          >
                            {lead.businessName || lead.name || "Unnamed Business"}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-zinc-500">
                              {lead.phone}
                            </span>
                            {lead.email && (
                              <span className="text-[11px] text-zinc-500 truncate max-w-[140px]">
                                • {lead.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isProcessing && (isCoolingDown || isSmartPausing) && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-full">
                            <ClockIcon className="w-3 h-3 text-indigo-400 animate-spin" />
                            <span className="text-[10px] font-mono text-indigo-300 font-bold">
                              {timeLeft}s
                            </span>
                          </div>
                        )}

                        {lead.automationStatus === "sent" && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                            <CheckIcon className="w-3 h-3" />
                            <span>V-{lead.scriptVersion || activeScript}</span>
                          </div>
                        )}

                        {/* Convert Lead Button */}
                        {lead.stage !== "paid" && (
                          <button
                            onClick={() => openConvertModal(lead)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                            title="Convert to Consumer Profile"
                          >
                            <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Convert</span>
                          </button>
                        )}

                        <button
                          disabled={isAutoRunning}
                          onClick={() => sendWhatsApp(lead.id, activeScript)}
                          className="p-2 rounded-xl text-zinc-300 bg-zinc-800/80 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all border border-zinc-700/50 cursor-pointer"
                          title="Send Direct WhatsApp Message"
                        >
                          <DevicePhoneMobileIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination Controls Footer */}
          {pagination.total > 0 && (
            <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span>
                  Showing <strong className="text-white">{startIndex + 1}</strong> to{" "}
                  <strong className="text-white">{endIndex}</strong> of{" "}
                  <strong className="text-white">{pagination.total}</strong> leads
                </span>

                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-zinc-500">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>

                <div className="text-xs font-mono font-medium px-2 text-zinc-300">
                  Page {pagination.page} of {pagination.totalPages}
                </div>

                <button
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating Engine Controller Bar */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-zinc-900/90 border border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-lg p-3 sm:p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-xl ${
              isAutoRunning
                ? "bg-indigo-600/20 text-indigo-400 animate-pulse"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {isAutoRunning ? (
              <PaperAirplaneIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentAction}</p>
            <p className="text-[11px] text-zinc-400 truncate">
              {selectedLeads.length > 0
                ? `Targeting ${selectedLeads.length} selected lead(s)`
                : `Targeting stage queue (${pendingLeadsCount} unsent)`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isAutoRunning ? (
            <button
              onClick={stopEngine}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PauseIcon className="w-4 h-4" />
              <span>Pause Engine</span>
            </button>
          ) : (
            <button
              onClick={startEngine}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Start Automation</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlusIcon className="w-5 h-5 text-indigo-400" /> Add New Lead
              </h3>
              <button
                onClick={() => setIsAddLeadOpen(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+254712345678"
                  value={newLeadForm.phone}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, phone: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Name / Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={newLeadForm.name}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, name: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={newLeadForm.email}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, email: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Business Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retail Boutique"
                  value={newLeadForm.businessType}
                  onChange={(e) =>
                    setNewLeadForm({
                      ...newLeadForm,
                      businessType: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmittingLead ? "Saving..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Lead Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-amber-400" />
                Convert Lead to Consumer
              </h3>
              <button
                onClick={() => setConvertingLead(null)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConvertLead} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={convertForm.name}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, name: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Email Address * (Used for User Login)
                </label>
                <input
                  type="email"
                  required
                  placeholder="consumer@example.com"
                  value={convertForm.email}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, email: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={convertForm.phone}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, phone: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Account Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={convertForm.password}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, password: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Conversion Notes
                </label>
                <textarea
                  rows={2}
                  value={convertForm.notes}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, notes: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertingLead(null)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConvert}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white shadow-md shadow-amber-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmittingConvert ? "Converting..." : "Complete Conversion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}