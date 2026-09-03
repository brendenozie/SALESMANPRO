"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapInboxConversation = exports.mapSender = exports.mapArchiveStatus = exports.mapConversationUiStatus = void 0;
function mapConversationUiStatus(status, humanHandoff) {
    if (humanHandoff || status === "WAITING_FOR_AGENT")
        return "PENDING_HANDOFF";
    if (status === "RESOLVED" || status === "CLOSED")
        return "RESOLVED";
    return "ACTIVE";
}
exports.mapConversationUiStatus = mapConversationUiStatus;
function mapArchiveStatus(status, humanHandoff) {
    if (status === "CLOSED")
        return "ARCHIVED";
    if (humanHandoff || status === "WAITING_FOR_AGENT")
        return "HANDOFF_REQUIRED";
    if (status === "RESOLVED")
        return "RESOLVED";
    return "ACTIVE";
}
exports.mapArchiveStatus = mapArchiveStatus;
function mapSender(senderType, isAI) {
    if (senderType === "CUSTOMER")
        return "USER";
    if (senderType === "AI" || isAI)
        return "AI";
    if (senderType === "AGENT")
        return "AGENT";
    return "AGENT";
}
exports.mapSender = mapSender;
function mapInboxConversation(conv) {
    const contactName = conv.WhatsAppContact?.name ||
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
exports.mapInboxConversation = mapInboxConversation;
