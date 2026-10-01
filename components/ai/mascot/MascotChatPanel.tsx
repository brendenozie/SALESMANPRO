"use client";

/**
 * components/ai/mascot/MascotChatPanel.tsx
 *
 * Full conversational interface for the SalesmanPro AI Mascot.
 * Features:
 * - Real-time store context panel (Store, Category, Role, AI Credits)
 * - Dynamic suggested prompt chips for the current dashboard route
 * - Interactive action cards with [Confirm] / [Cancel] approval gates
 * - Deep link buttons back to canonical SalesmanPro pages
 * - Integrated Web Speech API for hands-free voice commands & speech synthesis
 * - Transactional credit deduction reporting
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  XMarkIcon,
  MinusIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { MascotAvatar } from "./MascotAvatar";
import { MascotTaskCenter } from "./MascotTaskCenter";
import { DocumentReviewModal } from "./DocumentReviewModal";
import {
  MascotState,
  MascotContext,
  MascotMessage,
  MascotActionCard,
} from "@/lib/ai/mascot/types";
import { ExtractedDocumentData, DocumentActionDraft } from "@/lib/ai/mascot/documentTypes";

interface MascotChatPanelProps {
  context: MascotContext | null;
  state: MascotState;
  suggestedActions: string[];
  onClose: () => void;
  onMinimize: () => void;
  onSend: (message: string, isVoice?: boolean) => Promise<void>;
  onExecuteAction: (card: MascotActionCard) => Promise<void>;
  onApproveTicket?: (approvalId: string, action: "APPROVE" | "REJECT") => Promise<void>;
  messages: MascotMessage[];
  loading: boolean;
}

export const MascotChatPanel: React.FC<MascotChatPanelProps> = ({
  context,
  state,
  suggestedActions = [],
  onClose,
  onMinimize,
  onSend,
  onExecuteAction,
  onApproveTicket,
  messages = [],
  loading = false,
}) => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<"CHAT" | "TASKS">("CHAT");
  const [activeTaskCount, setActiveTaskCount] = useState<number>(0);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [reviewModalData, setReviewModalData] = useState<{
    extractedData: ExtractedDocumentData;
    actionDraft: DocumentActionDraft;
    previewUrl?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = "";

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (context?.companyId) {
        formData.append("companyId", context.companyId);
      }
      if (context?.storeSlug) {
        formData.append("storeSlug", context.storeSlug);
      }
      if (context?.userRole) {
        formData.append("userRole", context.userRole);
      }

      const res = await fetch("/api/ai/mascot/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to process document");
        return;
      }

      if (context && typeof data.creditUsage?.balanceRemaining === "number") {
        context.aiCreditBalance = data.creditUsage.balanceRemaining;
      }

      setReviewModalData({
        extractedData: data.extractedData,
        actionDraft: data.actionDraft,
        previewUrl: data.previewUrl,
      });
    } catch (err: any) {
      alert(err?.message || "Failed to upload document");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Poll active task count for badge indicator
  useEffect(() => {
    if (!context?.companyId) return;
    const checkTasks = async () => {
      try {
        const res = await fetch(`/api/ai/mascot/tasks?companyId=${context.companyId}&limit=10`);
        const data = await res.json();
        if (data.success && Array.isArray(data.tasks)) {
          const count = data.tasks.filter((t: any) =>
            ["RUNNING", "QUEUED", "AWAITING_APPROVAL", "RETRYING"].includes(t.status)
          ).length;
          setActiveTaskCount(count);
        }
      } catch (err) {
        // silent
      }
    };
    checkTasks();
    const interval = setInterval(checkTasks, 5000);
    return () => clearInterval(interval);
  }, [context?.companyId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          // Automatically submit voice transcript
          if (transcript.trim()) {
            onSend(transcript, true);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onSend]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Voice start error", err);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const msg = inputText.trim();
    setInputText("");
    await onSend(msg);
  };

  const handleCardConfirm = async (card: MascotActionCard) => {
    setActionInProgress(card.id);
    try {
      if (card.approvalId && onApproveTicket) {
        await onApproveTicket(card.approvalId, "APPROVE");
      } else {
        await onExecuteAction(card);
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCardReject = async (card: MascotActionCard) => {
    if (card.approvalId && onApproveTicket) {
      setActionInProgress(card.id);
      try {
        await onApproveTicket(card.approvalId, "REJECT");
      } finally {
        setActionInProgress(null);
      }
    }
  };

  const currentPathShort = context?.currentPath?.replace(/^\/admin\/[^\/]+/, "") || "Dashboard";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col w-[380px] sm:w-[440px] h-[590px] max-h-[85vh] bg-white dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden font-sans z-[9999]"
    >
      {/* 1. HEADER WITH CONTEXT TRANSPARENCY */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-700/60 shrink-0">
        <div className="flex items-center space-x-3">
          <MascotAvatar state={isListening ? "listening" : state} size="sm" />
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm tracking-tight text-white">SalesmanPro Assistant</span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-semibold px-1.5 py-0.5 rounded-full border border-indigo-500/40">
                AI
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-slate-300">
              <span className="truncate max-w-[120px] font-medium">{context?.companyName || "Store"}</span>
              <span>•</span>
              <span className="text-slate-400 capitalize">{context?.userRole?.toLowerCase() || "staff"}</span>
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center space-x-1">
          {/* Voice Mute Toggle */}
          <button
            onClick={() => setVoiceMuted(!voiceMuted)}
            title={voiceMuted ? "Unmute Voice Responses" : "Mute Voice Responses"}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            {voiceMuted ? (
              <SpeakerXMarkIcon className="w-4 h-4 text-slate-500" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4 text-sky-400" />
            )}
          </button>

          {/* Minimize */}
          <button
            onClick={onMinimize}
            title="Minimize"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <MinusIcon className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. CONTEXT & AI CREDITS PILL BAR */}
      <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
            {context?.storeCategory || "Store"}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 truncate max-w-[140px]">
            {currentPathShort || "Dashboard"}
          </span>
        </div>

        {/* AI Credit Balance */}
        <Link
          href={`/admin/${context?.storeSlug || "store"}/ai-settings`}
          title="Manage AI Credits"
          className="flex items-center space-x-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold text-[11px] border border-indigo-200/70 dark:border-indigo-800 transition-colors"
        >
          <SparklesIcon className="w-3 h-3 text-indigo-500" />
          <span>{context?.aiCreditBalance?.toLocaleString() || 0} Credits</span>
        </Link>
      </div>

      {/* 2b. PANEL NAVIGATION TABS */}
      <div className="flex items-center px-3 pt-1.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800/80 gap-1 text-xs font-semibold shrink-0">
        <button
          onClick={() => setPanelTab("CHAT")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition border-b-2 ${
            panelTab === "CHAT"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setPanelTab("TASKS")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition border-b-2 ${
            panelTab === "TASKS"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <ClockIcon className="w-3.5 h-3.5" />
          <span>Background Tasks</span>
          {activeTaskCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-bold animate-pulse">
              {activeTaskCount}
            </span>
          )}
        </button>
      </div>

      {panelTab === "TASKS" ? (
        <div className="flex-1 overflow-hidden p-2 bg-slate-50/50 dark:bg-slate-950/30">
          <MascotTaskCenter
            companyId={context?.companyId || ""}
            storeSlug={context?.storeSlug}
            userRole={context?.userRole}
            compact
          />
        </div>
      ) : (
        <>

      {/* 3. SUGGESTED ACTION PILLS */}
      {suggestedActions && suggestedActions.length > 0 && (
        <div className="px-3 py-2 bg-slate-100/50 dark:bg-slate-900/40 border-b border-slate-200/40 dark:border-slate-800/40 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
          {suggestedActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onSend(action)}
              className="text-[11px] font-medium whitespace-nowrap bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all shrink-0"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* 4. CONVERSATION MESSAGES STREAM */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-sm">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 dark:text-slate-400">
            <MascotAvatar state="idle" size="lg" />
            <h3 className="mt-4 font-bold text-slate-800 dark:text-slate-100 text-base">
              Hello! I'm your SalesmanPro Assistant.
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-[280px]">
              I understand your store, products, orders, inventory, and role permissions. How can I help you operate today?
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/10"
                      : "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
                  }`}
                >
                  {/* Markdown or plain text message */}
                  <div className="whitespace-pre-line text-[13px]">{msg.text}</div>

                  {/* Deep Link Navigation Buttons */}
                  {msg.deepLinks && msg.deepLinks.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap gap-1.5">
                      {msg.deepLinks.map((link, lIdx) => (
                        <Link
                          key={lIdx}
                          href={link.href}
                          className="inline-flex items-center space-x-1 text-xs font-semibold bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 hover:text-sky-700 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 shadow-sm transition-colors"
                        >
                          <span>{link.label}</span>
                          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Interactive Action Card with Approval Controls */}
                  {msg.actionCard && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {msg.actionCard.title}
                        </span>
                        {msg.actionCard.requiresApproval ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            <span>Approval Required</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>Ready to Execute</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {msg.actionCard.description}
                      </p>

                      {/* Action Confirmation Buttons */}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          disabled={actionInProgress === msg.actionCard.id}
                          onClick={() => handleCardConfirm(msg.actionCard!)}
                          className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                          {actionInProgress === msg.actionCard.id ? (
                            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                          )}
                          <span>Confirm & Execute</span>
                        </button>

                        {msg.actionCard.requiresApproval && (
                          <button
                            disabled={actionInProgress === msg.actionCard.id}
                            onClick={() => handleCardReject(msg.actionCard!)}
                            className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}

        {/* Live Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs italic">
            <MascotAvatar state="thinking" size="sm" />
            <span>Consulting store records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. INPUT & VOICE CONTROLS */}
      <form
        onSubmit={handleFormSubmit}
        className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0"
      >
        {isListening && (
          <div className="mb-2 p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 animate-pulse">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <span>Listening... Speak your command clearly</span>
            </span>
            <button
              type="button"
              onClick={toggleVoiceInput}
              className="text-[11px] font-bold text-purple-800 dark:text-purple-200 underline"
            >
              Stop
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* File Upload / Camera Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingDoc}
            title="Upload receipt or document"
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            {uploadingDoc ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin text-indigo-500" />
            ) : (
              <PaperClipIcon className="w-4 h-4" />
            )}
          </button>

          {/* Voice Microphone Toggle */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? "Stop Listening" : "Tap to Speak"}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? "bg-purple-600 text-white animate-pulse"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <MicrophoneIcon className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about inventory, orders, pricing, sales..."
            className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
      </>
      )}

      {/* Side-by-Side Document Review & Approval Modal */}
      {reviewModalData && (
        <DocumentReviewModal
          isOpen={!!reviewModalData}
          onClose={() => setReviewModalData(null)}
          extracted={reviewModalData.extractedData}
          suggestedAction={reviewModalData.actionDraft}
          previewUrl={reviewModalData.previewUrl}
          companyId={context?.companyId || ""}
          storeSlug={context?.storeSlug}
          onSuccess={(result) => {
            onSend(`I have approved and booked expense record ${result?.record?.expenseId || "Voucher"} for KES ${result?.record?.amount?.toLocaleString() || ""}.`);
          }}
        />
      )}
    </motion.div>
  );
};
