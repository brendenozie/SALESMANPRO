"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  UserCheckIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckBadgeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

export interface Message {
  id: string;
  sender: "USER" | "AI" | "AGENT";
  text: string;
  timestamp: string;
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

  const activeChat = conversations.find((c) => c.id === activeId);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm);
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
    } catch (err) {
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
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeChat.id
              ? {
                  ...c,
                  lastMessage: textToSend,
                  lastMessageTime: "Just now",
                  aiHandled: false, // Replying manually turns off auto-AI response
                  messages: [...c.messages, newMsg],
                }
              : c
          )
        );
        setNewMessageText("");
      } else {
        toast.error("Failed to deliver WhatsApp message");
      }
    } catch (error) {
      toast.error("Network error while sending message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 md:p-6 font-sans">
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
                  placeholder="Search phone or customer..."
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
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      filter === f
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
              {filteredConversations.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveId(chat.id)}
                  className={`p-4 cursor-pointer transition-all flex items-start gap-3 ${
                    activeId === chat.id
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 text-xs">
                      {chat.customerName.charAt(0)}
                    </div>
                    {chat.aiHandled && (
                      <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 rounded-full text-black">
                        <SparklesIcon className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {chat.customerName}
                      </h4>
                      <span className="text-[9px] font-mono text-slate-400">{chat.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{chat.lastMessage}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] font-mono text-slate-400">{chat.phoneNumber}</span>
                      {chat.status === "PENDING_HANDOFF" && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Needs Human
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messaging Canvas */}
          {activeChat ? (
            <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-50/50 dark:bg-black/20">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {activeChat.customerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeChat.customerName}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <PhoneIcon className="h-3 w-3" /> {activeChat.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Handoff Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAiHandoff(activeChat.id, activeChat.aiHandled)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      activeChat.aiHandled
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20"
                    }`}
                  >
                    {activeChat.aiHandled ? (
                      <>
                        <SparklesIcon className="h-4 w-4" /> AI Automated
                      </>
                    ) : (
                      <>
                        <UserCheckIcon className="h-4 w-4" /> Agent Manual
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeChat.messages.map((msg) => {
                  const isUser = msg.sender === "USER";
                  const isAi = msg.sender === "AI";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400">
                          {isUser ? activeChat.customerName : isAi ? "AI Engine" : "Human Agent"}
                        </span>
                        <span className="text-[8px] text-slate-400">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/60"
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

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type manual reply (disables AI for this session)..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessageText.trim()}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <PaperAirplaneIcon className="h-4 w-4" /> Send
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <ChatBubbleLeftRightIcon className="h-12 w-12 stroke-1 mb-2 text-slate-500" />
              <p className="text-xs">Select a WhatsApp chat to view message history and send direct replies.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}