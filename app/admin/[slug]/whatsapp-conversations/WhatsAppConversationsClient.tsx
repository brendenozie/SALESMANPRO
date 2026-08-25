"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  ChatBubbleLeftEllipsisIcon,
  SparklesIcon,
  UserCheckIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  FunnelIcon,
  PhoneIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

export interface LogMessage {
  id: string;
  sender: "USER" | "AI" | "AGENT";
  text: string;
  timestamp: string;
}

export interface ConversationLog {
  id: string;
  customerName: string;
  phoneNumber: string;
  sessionStart: string;
  lastActivity: string;
  status: "ACTIVE" | "RESOLVED" | "HANDOFF_REQUIRED" | "ARCHIVED";
  handledBy: "AI" | "HUMAN" | "HYBRID";
  totalMessages: number;
  intentCategory: string;
  satisfactionScore?: number;
  messages: LogMessage[];
}

interface Props {
  initialConversations: ConversationLog[];
  companyId: string;
}

export default function WhatsAppConversationsClient({
  initialConversations,
  companyId,
}: Props) {
  const [conversations, setConversations] =
    useState<ConversationLog[]>(initialConversations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [handlerFilter, setHandlerFilter] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<ConversationLog | null>(null);

  // Stats calculation
  const totalCount = conversations.length;
  const aiResolvedCount = conversations.filter(
    (c) => c.handledBy === "AI" && c.status === "RESOLVED"
  ).length;
  const handoffCount = conversations.filter(
    (c) => c.status === "HANDOFF_REQUIRED"
  ).length;

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm) ||
      c.intentCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;
    const matchesHandler =
      handlerFilter === "ALL" || c.handledBy === handlerFilter;

    return matchesSearch && matchesStatus && matchesHandler;
  });

  const updateStatus = async (
    conversationId: string,
    newStatus: ConversationLog["status"]
  ) => {
    try {
      const res = await fetch(
        `/api/admin/whatsapp/conversations/${conversationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, companyId }),
        }
      );

      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, status: newStatus } : c))
        );
        if (selectedLog?.id === conversationId) {
          setSelectedLog((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        toast.success(`Conversation marked as ${newStatus}`);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const exportLogsCsv = () => {
    const headers = ["ID,Customer,Phone,Status,Handler,Total Messages,Intent,Start Time\n"];
    const rows = filteredConversations.map(
      (c) =>
        `"${c.id}","${c.customerName}","${c.phoneNumber}","${c.status}","${c.handledBy}",${c.totalMessages},"${c.intentCategory}","${c.sessionStart}"`
    );
    const blob = new Blob([headers.concat(rows).join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `whatsapp-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                Audit & Analytics
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Conversation <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Archives.</span>
            </h1>
          </div>

          <button
            onClick={exportLogsCsv}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <ArrowDownTrayIcon className="h-4 w-4 stroke-[2 shadow-sm]" />
            Export CSV Log
          </button>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Total Logs Recorded
              </span>
              <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {totalCount} Sessions
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Automated AI Resolutions
              </span>
              <SparklesIcon className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {aiResolvedCount} Resolved
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Pending Escalations
              </span>
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {handoffCount} Requests
            </h3>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, phone, or intent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-11 pr-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1.5">
              <FunnelIcon className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="HANDOFF_REQUIRED">Handoff Required</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1.5">
              <select
                value={handlerFilter}
                onChange={(e) => setHandlerFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="ALL">All Handlers</option>
                <option value="AI">AI Agent</option>
                <option value="HUMAN">Human Agent</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversation Logs Table */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] font-black tracking-wider text-slate-400">
                <tr>
                  <th className="p-4 pl-6">Customer</th>
                  <th className="p-4">Handler</th>
                  <th className="p-4">Intent</th>
                  <th className="p-4">Messages</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredConversations.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.customerName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <PhoneIcon className="h-3 w-3" /> {log.phoneNumber}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.handledBy === "AI"
                            ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20"
                            : log.handledBy === "HUMAN"
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                            : "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                        }`}
                      >
                        {log.handledBy === "AI" ? (
                          <SparklesIcon className="h-3 w-3" />
                        ) : (
                          <UserCheckIcon className="h-3 w-3" />
                        )}
                        {log.handledBy}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        <TagIcon className="h-3 w-3 text-slate-400" />
                        {log.intentCategory}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {log.totalMessages} msgs
                    </td>

                    <td className="p-4 text-slate-400 text-[11px] font-mono">
                      {log.lastActivity}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          log.status === "RESOLVED"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                            : log.status === "HANDOFF_REQUIRED"
                            ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                            : log.status === "ARCHIVED"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                        }`}
                      >
                        {log.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl text-xs transition-all"
                      >
                        Inspect Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- INSPECT LOG MODAL --- */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedLog(null)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedLog.customerName}
                </h2>
                <p className="text-xs font-mono text-slate-500">
                  {selectedLog.phoneNumber} • Session ID: {selectedLog.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Transcript Feed */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {selectedLog.messages.map((msg) => {
                const isUser = msg.sender === "USER";
                const isAi = msg.sender === "AI";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? "items-start" : "items-end"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-bold uppercase text-slate-400">
                        {isUser
                          ? selectedLog.customerName
                          : isAi
                          ? "AI Engine"
                          : "Human Agent"}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                        isUser
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/60"
                          : isAi
                          ? "bg-teal-600 text-white rounded-br-none"
                          : "bg-emerald-600 text-white rounded-br-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(selectedLog.id, "RESOLVED")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs transition-all border border-emerald-500/20"
                >
                  <CheckCircleIcon className="h-4 w-4" /> Mark Resolved
                </button>
                <button
                  onClick={() => updateStatus(selectedLog.id, "ARCHIVED")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all"
                >
                  <ArchiveBoxIcon className="h-4 w-4" /> Archive
                </button>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}