"use strict";
/**
 * lib/api/whatsAppClient.ts
 *
 * Strongly-typed frontend client for SalesmanPro WhatsApp Admin APIs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsAppClient = void 0;
exports.whatsAppClient = {
    async getOverview(range = "30d", companyId) {
        const params = new URLSearchParams({ range });
        if (companyId)
            params.set("companyId", companyId);
        const res = await fetch(`/api/admin/whatsapp/overview?${params.toString()}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to fetch WhatsApp overview");
        }
        return json.data;
    },
    async getConversations(params = {}) {
        const query = new URLSearchParams();
        if (params.status)
            query.set("status", params.status);
        if (params.search)
            query.set("search", params.search);
        if (params.includeMessages)
            query.set("includeMessages", "true");
        if (params.companyId)
            query.set("companyId", params.companyId);
        const res = await fetch(`/api/admin/whatsapp/conversations?${query.toString()}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to fetch conversations");
        }
        return json.data || [];
    },
    async getConversation(id, companyId) {
        const query = new URLSearchParams();
        if (companyId)
            query.set("companyId", companyId);
        const res = await fetch(`/api/admin/whatsapp/conversations/${id}?${query.toString()}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to fetch conversation");
        }
        return json.data;
    },
    async getMessages(conversationId, companyId) {
        const query = new URLSearchParams({ conversationId });
        if (companyId)
            query.set("companyId", companyId);
        const res = await fetch(`/api/admin/whatsapp/messages?${query.toString()}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to fetch messages");
        }
        return json.data || [];
    },
    async sendMessage(params) {
        const res = await fetch("/api/admin/whatsapp/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to send WhatsApp message");
        }
        return json.data;
    },
    async updateConversationStatus(id, params) {
        const res = await fetch(`/api/admin/whatsapp/conversations/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to update conversation status");
        }
        return json.data;
    },
    async toggleAiHandoff(id, aiHandled, companyId) {
        const res = await fetch(`/api/admin/whatsapp/conversations/${id}/handoff`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aiHandled, companyId }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to toggle AI handoff");
        }
        return json.data;
    },
    async getSettings(companyId) {
        const query = new URLSearchParams();
        if (companyId)
            query.set("companyId", companyId);
        const res = await fetch(`/api/admin/whatsapp/settings?${query.toString()}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to fetch settings");
        }
        return json.data;
    },
    async saveSettings(data) {
        const res = await fetch("/api/admin/whatsapp/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to save settings");
        }
        return json.data;
    },
    async getTemplates(companyId) {
        const query = new URLSearchParams();
        if (companyId)
            query.set("companyId", companyId);
        const res = await fetch(`/api/admin/whatsapp/templates?${query.toString()}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to fetch templates");
        }
        return json.data || [];
    },
    async createTemplate(data) {
        const res = await fetch("/api/admin/whatsapp/templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to create template");
        }
        return json.data;
    },
    async dispatchBroadcast(data) {
        const res = await fetch("/api/admin/whatsapp/broadcasts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to dispatch broadcast");
        }
        return json.data;
    },
};
