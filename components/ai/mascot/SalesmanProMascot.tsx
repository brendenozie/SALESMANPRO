"use client";

/**
 * components/ai/mascot/SalesmanProMascot.tsx
 *
 * Floating, animated, role-aware AI Business Assistant for SalesmanPro.
 * Embeds seamlessly across the SalesmanPro dashboard without obstructing controls.
 * Features drag-and-drop repositioning, state persistence, voice speech, and safe execution.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";
import { MascotAvatar } from "./MascotAvatar";
import { MascotChatPanel } from "./MascotChatPanel";
import {
  MascotState,
  MascotContext,
  MascotMessage,
  MascotActionCard,
} from "@/lib/ai/mascot/types";

export const SalesmanProMascot: React.FC = () => {
  const pathname = usePathname();
  const storeContext = useStoreContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [context, setContext] = useState<MascotContext | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [messages, setMessages] = useState<MascotMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTaskCount, setActiveTaskCount] = useState(0);

  // Poll for background task activity across dashboard
  useEffect(() => {
    if (!context?.companyId) return;
    const checkActiveTasks = async () => {
      try {
        const res = await fetch(`/api/ai/mascot/tasks?companyId=${context.companyId}&limit=10`);
        const data = await res.json();
        if (data.success && Array.isArray(data.tasks)) {
          const count = data.tasks.filter((t: any) =>
            ["RUNNING", "QUEUED", "AWAITING_APPROVAL", "RETRYING"].includes(t.status)
          ).length;
          setActiveTaskCount(count);
        }
      } catch {
        // silent
      }
    };
    checkActiveTasks();
    const interval = setInterval(checkActiveTasks, 6000);
    return () => clearInterval(interval);
  }, [context?.companyId]);

  // Position coordinates persisted in localStorage
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const positionLoaded = useRef(false);

  // Load persisted position on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPos = localStorage.getItem("salesmanpro_mascot_pos");
        if (savedPos) {
          setPosition(JSON.parse(savedPos));
        }
      } catch (err) {
        // Fallback default
      }
      positionLoaded.current = true;
    }
  }, []);

  const savePosition = (x: number, y: number) => {
    setPosition({ x, y });
    try {
      localStorage.setItem("salesmanpro_mascot_pos", JSON.stringify({ x, y }));
    } catch (err) {
      // Ignore localStorage errors
    }
  };

  // Fetch real-time mascot context & authorized capabilities
  const fetchContext = useCallback(async () => {
    try {
      const companyId = storeContext?.storeFormData?.id || undefined;
      const res = await fetch(
        `/api/ai/mascot/context?companyId=${companyId || ""}&currentPath=${encodeURIComponent(
          pathname || "",
        )}`,
      );
      if (!res.ok) return;

      const data = await res.json();
      if (data.success) {
        setContext(data.context);
        setSuggestedActions(data.suggestedActions || []);
      }
    } catch (err) {
      console.warn("[MASCOT_CONTEXT_FETCH_WARNING]", err);
    }
  }, [storeContext?.storeFormData?.id, pathname]);

  // Re-fetch context when pathname or store changes
  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  // Text-To-Speech helper
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        // Clean markdown symbols for smooth audio
        const clean = text.replace(/[*_#`~>\[\]\(\)]/g, "").replace(/\n+/g, ". ");
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onstart = () => setMascotState("speaking");
        utterance.onend = () => setMascotState("idle");
        utterance.onerror = () => setMascotState("idle");
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setMascotState("idle");
      }
    }
  };

  // Handle sending a chat message or voice query
  const handleSendMessage = async (userText: string, isVoice = false) => {
    const userMsg: MascotMessage = {
      id: `msg_${Date.now()}_u`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setMascotState("thinking");

    try {
      const res = await fetch("/api/ai/mascot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          companyId: context?.companyId,
          currentPath: pathname,
          isVoice,
        }),
      });

      const data = await res.json();

      const mascotMsg: MascotMessage = {
        id: `msg_${Date.now()}_m`,
        sender: "mascot",
        text: data.reply || "I've processed your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        deepLinks: data.deepLinks,
        actionCard: data.actionCard,
        state: data.state || "idle",
      };

      setMessages((prev) => [...prev, mascotMsg]);
      setMascotState(data.state || "idle");

      // Update local credit balance
      if (typeof data.creditBalance === "number" && context) {
        setContext({ ...context, aiCreditBalance: data.creditBalance });
      }

      // If voice enabled, speak the reply
      if (isVoice && data.reply) {
        speakText(data.reply);
      }
    } catch (err: any) {
      setMascotState("error");
      const errorMsg: MascotMessage = {
        id: `msg_${Date.now()}_err`,
        sender: "mascot",
        text: `Error: ${err.message || "Failed to reach AI assistant."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Handle direct execution of confirmed action card
  const handleExecuteAction = async (card: MascotActionCard) => {
    setLoading(true);
    setMascotState("processing");

    try {
      const res = await fetch("/api/ai/mascot/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capabilityId: card.capabilityId,
          payload: card.payload,
          companyId: context?.companyId,
          currentPath: pathname,
        }),
      });

      const data = await res.json();

      const confirmMsg: MascotMessage = {
        id: `msg_${Date.now()}_exec`,
        sender: "mascot",
        text: data.reply || "Operation executed successfully.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        deepLinks: data.deepLinks,
        state: data.success ? "success" : "error",
      };

      setMessages((prev) => [...prev, confirmMsg]);
      setMascotState(data.success ? "success" : "error");

      // Reset to idle after 4 seconds
      setTimeout(() => setMascotState("idle"), 4000);
    } catch (err: any) {
      setMascotState("error");
    } finally {
      setLoading(false);
    }
  };

  // Handle approving or rejecting an approval ticket
  const handleApproveTicket = async (approvalId: string, action: "APPROVE" | "REJECT") => {
    setLoading(true);
    setMascotState("processing");

    try {
      const res = await fetch("/api/ai/mascot/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          action,
          companyId: context?.companyId,
        }),
      });

      const data = await res.json();

      const msg: MascotMessage = {
        id: `msg_${Date.now()}_app`,
        sender: "mascot",
        text: data.reply || (action === "APPROVE" ? "Approved and executed." : "Action cancelled."),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        deepLinks: data.deepLinks,
        state: data.success ? "success" : "idle",
      };

      setMessages((prev) => [...prev, msg]);
      setMascotState(data.success ? "success" : "idle");
      setTimeout(() => setMascotState("idle"), 4000);
    } catch (err: any) {
      setMascotState("error");
    } finally {
      setLoading(false);
    }
  };

  // If mascot is disabled by store settings, do not render
  if (context && context.mascotEnabled === false) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[99999] pointer-events-none">
      <AnimatePresence>
        {isOpen ? (
          // Expanded Conversational Chat Panel
          <motion.div
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => savePosition(info.point.x, info.point.y)}
            className="pointer-events-auto shadow-2xl rounded-3xl"
          >
            <MascotChatPanel
              context={context}
              state={mascotState}
              suggestedActions={suggestedActions}
              onClose={() => setIsOpen(false)}
              onMinimize={() => {
                setIsOpen(false);
                setIsMinimized(true);
              }}
              onSend={handleSendMessage}
              onExecuteAction={handleExecuteAction}
              onApproveTicket={handleApproveTicket}
              messages={messages}
              loading={loading}
            />
          </motion.div>
        ) : (
          // Minimized Floating Character Orb
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => savePosition(info.point.x, info.point.y)}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setUnreadCount(0);
            }}
            className="pointer-events-auto relative group flex items-center justify-center p-1 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-2xl cursor-pointer transition-shadow hover:shadow-indigo-500/20"
          >
            <MascotAvatar state={mascotState} size="md" />

            {/* Unread Alert Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
                {unreadCount}
              </span>
            )}

            {/* Active Background Tasks Badge */}
            {activeTaskCount > 0 && unreadCount === 0 && (
              <span
                title={`${activeTaskCount} background task${activeTaskCount > 1 ? 's' : ''} running`}
                className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-indigo-600 text-white font-bold text-[9px] rounded-full flex items-center gap-1 border-2 border-slate-900 shadow animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {activeTaskCount}
              </span>
            )}

            {/* Hover Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              SalesmanPro Assistant
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
