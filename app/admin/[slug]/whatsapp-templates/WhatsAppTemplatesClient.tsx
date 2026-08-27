"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  DocumentTextIcon,
  PlusIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  GlobeAltIcon,
  TrashIcon,
  CogIcon,
  MegaphoneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export interface Template {
  id: string;
  name: string;
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  headerText?: string;
  bodyText: string;
  footerText?: string;
  variables: string[];
  createdAt: string;
}

interface Props {
  initialTemplates: Template[];
  companyId: string;
}

export default function WhatsAppTemplatesClient({
  initialTemplates,
  companyId,
}: Props) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for New Template
  const [formData, setFormData] = useState({
    name: "",
    category: "MARKETING" as Template["category"],
    language: "en_US",
    headerText: "",
    bodyText: "",
    footerText: "",
  });

  // Broadcast Form State
  const [broadcastData, setBroadcastData] = useState({
    audienceSegment: "ALL_CUSTOMERS",
    customNumbers: "",
  });

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bodyText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Extract variables in {{1}}, {{2}} format
    const matches = formData.bodyText.match(/\{\{\d+\}\}/g) || [];
    const variables = Array.from(new Set(matches));

    try {
      const res = await fetch(`/api/admin/whatsapp/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, variables, companyId }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setTemplates((prev) => [result.data, ...prev]);
        toast.success("Template submitted to Meta for approval!");
        setIsCreateModalOpen(false);
        setFormData({
          name: "",
          category: "MARKETING",
          language: "en_US",
          headerText: "",
          bodyText: "",
          footerText: "",
        });
      } else {
        toast.error(result.message || "Failed to create template");
      }
    } catch (err) {
      toast.error("Network error while submitting template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Meta template?")) return;

    try {
      const res = await fetch(`/api/admin/whatsapp/templates/${id}?companyId=${companyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast.success("Template deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete template");
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/broadcasts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          audienceSegment: broadcastData.audienceSegment,
          customNumbers: broadcastData.customNumbers.split(",").map((n) => n.trim()),
          companyId,
        }),
      });

      if (res.ok) {
        toast.success(`Broadcast queued for template: ${selectedTemplate.name}`);
        setIsBroadcastModalOpen(false);
      } else {
        toast.error("Failed to queue broadcast campaign");
      }
    } catch (err) {
      toast.error("Broadcast delivery error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-6 md:p-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Outbound Engagement
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              WhatsApp <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Templates & Broadcasts.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[3]" />
              New Template
            </button>
          </div>
        </header>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Total Meta Templates</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{templates.length} Active</h3>
          </div>
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Approved for Broadcast</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {templates.filter((t) => t.status === "APPROVED").length} Ready
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Pending Review</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {templates.filter((t) => t.status === "PENDING").length} In Audit
            </h3>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-11 pr-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {(["ALL", "UTILITY", "MARKETING", "AUTHENTICATION"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-sm group"
            >
              <div className="space-y-4">
                {/* Meta Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      template.status === "APPROVED"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                        : template.status === "PENDING"
                        ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                        : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                    }`}
                  >
                    {template.status === "APPROVED" ? (
                      <CheckCircleIcon className="h-3 w-3" />
                    ) : template.status === "PENDING" ? (
                      <ClockIcon className="h-3 w-3" />
                    ) : (
                      <ExclamationTriangleIcon className="h-3 w-3" />
                    )}
                    {template.status}
                  </span>

                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 font-mono">
                    <GlobeAltIcon className="h-3 w-3" /> {template.language}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Category: {template.category}
                  </p>
                </div>

                {/* Simulated Chat Bubble UI Preview */}
                <div className="bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs text-slate-700 dark:text-slate-300 font-sans">
                  {template.headerText && (
                    <p className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      {template.headerText}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{template.bodyText}</p>
                  {template.footerText && (
                    <p className="text-[10px] text-slate-400 pt-1">{template.footerText}</p>
                  )}
                </div>

                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-mono rounded"
                      >
                        Variable {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                  title="Delete Template"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>

                <button
                  disabled={template.status !== "APPROVED"}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsBroadcastModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-xl transition-all"
                >
                  <MegaphoneIcon className="h-4 w-4" /> Broadcast
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CREATE TEMPLATE MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Create Meta WhatsApp Template
                </h2>
                <p className="text-xs text-slate-500">
                  Submit a message blueprint to WhatsApp for compliance review.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Template Identifier Name
                  </label>
                  <input
                    required
                    placeholder="order_status_update"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as Template["category"],
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="en_US">English (US)</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Header Text (Optional)
                  </label>
                  <input
                    placeholder="e.g. Order Confirmation"
                    value={formData.headerText}
                    onChange={(e) =>
                      setFormData({ ...formData, headerText: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Body Content (Use {"{{1}}"}, {"{{2}}"} for placeholders)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Hi {{1}}, your order #{{2}} has been confirmed and is scheduled for dispatch."
                    value={formData.bodyText}
                    onChange={(e) =>
                      setFormData({ ...formData, bodyText: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none leading-relaxed"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Footer Text (Optional)
                  </label>
                  <input
                    placeholder="e.g. Reply STOP to unsubscribe"
                    value={formData.footerText}
                    onChange={(e) =>
                      setFormData({ ...formData, footerText: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <CogIcon className="h-5 w-5 animate-spin" />
                ) : (
                  "Submit Template to Meta"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- SEND BROADCAST MODAL --- */}
      {isBroadcastModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsBroadcastModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MegaphoneIcon className="h-5 w-5 text-emerald-500" /> Dispatch Campaign
                </h2>
                <p className="text-xs text-slate-500">
                  Using template: <span className="font-mono text-emerald-500">{selectedTemplate.name}</span>
                </p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Target Audience Segment
                </label>
                <select
                  value={broadcastData.audienceSegment}
                  onChange={(e) =>
                    setBroadcastData({ ...broadcastData, audienceSegment: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="ALL_CUSTOMERS">All Registered Customers</option>
                  <option value="RECENT_BUYERS">Active Buyers (Past 30 Days)</option>
                  <option value="CUSTOM_LIST">Custom Phone Number List</option>
                </select>
              </div>

              {broadcastData.audienceSegment === "CUSTOM_LIST" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Phone Numbers (Comma separated with country code)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="+254712345678, +254798765432"
                    value={broadcastData.customNumbers}
                    onChange={(e) =>
                      setBroadcastData({ ...broadcastData, customNumbers: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <CogIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" /> Start Mass Broadcast
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}