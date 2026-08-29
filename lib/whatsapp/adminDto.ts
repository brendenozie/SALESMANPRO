import type { WhatsAppConversationMode, WhatsAppConversationStatus, WhatsAppMessageStatus } from "@prisma/client";

export type InboxUiStatus = "ACTIVE" | "PENDING_HANDOFF" | "RESOLVED";
export type ArchiveUiStatus = "ACTIVE" | "RESOLVED" | "HANDOFF_REQUIRED" | "ARCHIVED";

export function mapConversationUiStatus(
  status: WhatsAppConversationStatus,
  humanHandoff: boolean,
): InboxUiStatus {
  if (humanHandoff || status === "WAITING_FOR_AGENT") return "PENDING_HANDOFF";
  if (status === "RESOLVED" || status === "CLOSED") return "RESOLVED";
  return "ACTIVE";
}

export function mapArchiveStatus(
  status: WhatsAppConversationStatus,
  humanHandoff: boolean,
): ArchiveUiStatus {
  if (status === "CLOSED") return "ARCHIVED";
  if (humanHandoff || status === "WAITING_FOR_AGENT") return "HANDOFF_REQUIRED";
  if (status === "RESOLVED") return "RESOLVED";
  return "ACTIVE";
}

export function mapSender(senderType: string, isAI: boolean): "USER" | "AI" | "AGENT" {
  if (senderType === "CUSTOMER") return "USER";
  if (senderType === "AI" || isAI) return "AI";
  if (senderType === "AGENT") return "AGENT";
  return "AGENT";
}

export function mapInboxConversation(conv: {
  id: string;
  customerName: string | null;
  phoneNumber: string;
  status: WhatsAppConversationStatus;
  mode: WhatsAppConversationMode;
  humanHandoff: boolean;
  aiPaused: boolean;
  aiIntent: string | null;
  startedAt: Date;
  lastMessageAt: Date | null;
  WhatsAppContact: { name: string | null; profileName: string | null; phoneNumber: string } | null;
  messages: Array<{
    id: string;
    text: string | null;
    senderType: string;
    isAI: boolean;
    status: WhatsAppMessageStatus;
    createdAt: Date;
  }>;
  _count?: { messages: number };
}) {
  const contactName =
    conv.WhatsAppContact?.name ||
    conv.WhatsAppContact?.profileName ||
    conv.customerName ||
    conv.phoneNumber;
  const last = conv.messages[0];
  return {
    id: conv.id,
    customerName: contactName,
    phoneNumber: conv.WhatsAppContact?.phoneNumber || conv.phoneNumber,
    lastMessage: last?.text || "",
    lastMessageTime: last?.createdAt
      ? last.createdAt.toISOString()
      : conv.lastMessageAt?.toISOString() || conv.startedAt.toISOString(),
    unreadCount: 0,
    aiHandled: conv.mode === "AI" && !conv.humanHandoff && !conv.aiPaused,
    status: mapConversationUiStatus(conv.status, conv.humanHandoff),
    intentCategory: conv.aiIntent || "general",
    sessionStart: conv.startedAt.toISOString(),
    lastActivity: conv.lastMessageAt?.toISOString() || conv.startedAt.toISOString(),
    handledBy: conv.humanHandoff ? (conv.mode === "HUMAN" ? "HUMAN" : "HYBRID") : "AI",
    totalMessages: conv._count?.messages ?? conv.messages.length,
    messages: conv.messages
      .slice()
      .reverse()
      .map((m) => ({
        id: m.id,
        sender: mapSender(m.senderType, m.isAI),
        text: m.text || "",
        timestamp: m.createdAt.toISOString(),
        status: m.status,
      })),
  };
}
