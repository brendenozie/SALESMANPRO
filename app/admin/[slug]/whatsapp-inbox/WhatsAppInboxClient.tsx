"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ClockIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export interface Message {
  id: string;
  sender: "USER" | "AI" | "AGENT";
  text: string;
  timestamp: string;
  status?: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  phoneNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  aiHandled: boolean;
  status: "ACTIVE" | "PENDING_HANDOFF" | "RESOLVED";
  intentCategory?: string;
  messages: Message[];
}

interface Props {
  initialConversations: Conversation[];
  companyId: string;
}

export default function WhatsAppInboxClient({ initialConversations, companyId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string>(initialConversations[0]?.id || "");
  const [newMessageText, setNewMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING_HANDOFF" | "AI">("ALL");
  const [isSending, setIsSending] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find((c) => c.id === activeId) || conversations[0];

  // Auto-scroll chat to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages?.length]);

  // Live polling for conversation and message updates every 4 seconds
  useEffect(() => {
    let isMounted = true;

    const pollConversations = async () => {
      try {
        const res = await fetch(
          `/api/admin/whatsapp/conversations?includeMessages=true&companyId=${encodeURIComponent(companyId)}`
        );
        if (res.ok && isMounted) {
          const body = await res.json();
          if (Array.isArray(body.data)) {
            setConversations(body.data);
          }
        }
      } catch {
        // quiet fail on background polling
      }
    };

    const interval = setInterval(pollConversations, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [companyId]);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm) ||
      (c.intentCategory && c.intentCategory.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filter === "PENDING_HANDOFF") return matchesSearch && c.status === "PENDING_HANDOFF";
    if (filter === "AI") return matchesSearch && c.aiHandled;
    return matchesSearch;
  });

  const toggleAiHandoff = async (conversationId: string, currentAiHandled: boolean) => {
    const newAiState = !currentAiHandled;
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations/${conversationId}/handoff`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiHandled: newAiState, companyId }),
      });

      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                ...c,
                aiHandled: newAiState,
                status: newAiState ? "ACTIVE" : "PENDING_HANDOFF",
              }
              : c
          )
        );
        toast.success(
          newAiState
            ? "AI Bot reactivated for this conversation"
            : "Human Agent took control of conversation"
        );
      }
    } catch {
      toast.error("Failed to update takeover status");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChat) return;

    setIsSending(true);
    const textToSend = newMessageText.trim();

    try {
      const res = await fetch(`/api/admin/whatsapp/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeChat.id,
          toPhoneNumber: activeChat.phoneNumber,
          text: textToSend,
          message: textToSend,
          companyId,
        }),
      });

      if (res.ok) {
        const newMsg: Message = {
          id: Date.now().toString(),
          sender: "AGENT",
          text: textToSend,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "SENT",
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeChat.id
              ? {
                ...c,
                lastMessage: textToSend,
                lastMessageTime: "Just now",
                aiHandled: false,
                messages: [...(c.messages || []), newMsg],
              }
              : c
          )
        );
        setNewMessageText("");
      } else {
        toast.error("Failed to deliver WhatsApp message");
      }
    } catch {
      toast.error("Network error while sending message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="h-[calc(100vh-4.5rem)] bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 md:p-6 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Live Engagements
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              WhatsApp <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Inbox & AI Control.</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Auto-Sync Active
          </div>
        </header>

        {/* Main Work Area */}
        <div className="flex-1 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-0">
          {/* Conversation List Sidebar */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            {/* Search & Filters */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search phone, customer, intent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-1.5">
                {(["ALL", "PENDING_HANDOFF", "AI"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${filter === f
                        ? "bg-emerald-500 text-black shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                  >
                    {f === "PENDING_HANDOFF" ? "Handoff Req." : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No active conversations found matching your filter.
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = c.id === (activeChat?.id || activeId);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`w-full p-4 text-left transition-all flex flex-col gap-1.5 ${isSelected
                          ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-l-4 border-emerald-500"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {c.customerName || c.phoneNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {c.lastMessageTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {c.lastMessage || "Conversation opened"}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${c.aiHandled
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                            }`}
                        >
                          {c.aiHandled ? (
                            <>
                              <SparklesIcon className="h-3 w-3" /> AI Bot
                            </>
                          ) : (
                            <>
                              <CheckIcon className="h-3 w-3" /> Human Agent
                            </>
                          )}
                        </span>

                        {c.status === "PENDING_HANDOFF" && (
                          <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold uppercase rounded border border-amber-500/20">
                            Escalated
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Conversation Workspace */}
          {activeChat ? (
            <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black/20 min-h-0">
              {/* Chat Header Bar */}
              <div className="p-4 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {activeChat.customerName}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3 text-slate-400" /> {activeChat.phoneNumber}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAiHandoff(activeChat.id, activeChat.aiHandled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${activeChat.aiHandled
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                        : "bg-emerald-500 text-black font-extrabold hover:bg-emerald-400"
                      }`}
                  >
                    {activeChat.aiHandled ? (
                      <>
                        <CheckIcon className="h-4 w-4" /> Take Over Conversation
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4" /> Release to AI Bot
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Message Feed Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeChat.messages && activeChat.messages.length > 0 ? (
                  activeChat.messages.map((m) => {
                    const isUser = m.sender === "USER";
                    const isAi = m.sender === "AI";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-md p-3.5 rounded-2xl text-xs shadow-sm ${isUser
                              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/60 rounded-tl-sm"
                              : isAi
                                ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm"
                                : "bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-tr-sm"
                            }`}
                        >
                          <div className="flex items-center gap-1 mb-1 text-[9px] font-black uppercase opacity-80">
                            {isUser ? "Customer" : isAi ? "AI Concierge" : "Agent"}
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                          <span className="text-[9px] block text-right mt-1 opacity-70">
                            {m.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No message history available for this conversation yet.
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Type a human response... (Dispatches immediately via WhatsApp)"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessageText.trim()}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <PaperAirplaneIcon className="h-4 w-4" /> Send
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
              Select a conversation on the left to start live messaging.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}