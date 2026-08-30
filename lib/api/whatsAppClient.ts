/**
 * lib/api/whatsAppClient.ts
 *
 * Strongly-typed frontend client for SalesmanPro WhatsApp Admin APIs.
 */

export interface WhatsAppOverviewMetrics {
  inboundMessages: number;
  outboundMessages: number;
  aiResponses: number;
  humanResponses: number;
  failedMessages: number;
  activeConversations: number;
  escalations: number;
  activeCustomers: number;
  aiRequests: number;
  creditsUsed: number;
  tokens: number;
  failedAiRequests: number;
}

export interface WhatsAppOverviewResponse {
  connection: {
    connected: boolean;
    phoneNumber: string | null;
    displayName: string | null;
    status: string;
    lastWebhookAt: string | null;
    webhookHealthy: boolean;
    workerStatus: string;
    aiEnabled: boolean;
    model: string | null;
    lastError: string | null;
  };
  credits: {
    balance: number;
  };
  metrics: WhatsAppOverviewMetrics;
  recentActivity: Array<{
    id: string;
    text: string | null;
    direction: "INBOUND" | "OUTBOUND";
    senderType: string;
    status: string;
    createdAt: string;
    conversationId: string;
  }>;
}

export const whatsAppClient = {
  async getOverview(range = "30d", companyId?: string): Promise<WhatsAppOverviewResponse> {
    const params = new URLSearchParams({ range });
    if (companyId) params.set("companyId", companyId);
    const res = await fetch(`/api/admin/whatsapp/overview?${params.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to fetch WhatsApp overview");
    }
    return json.data;
  },

  async getConversations(params: {
    status?: string;
    search?: string;
    includeMessages?: boolean;
    companyId?: string;
  } = {}): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    if (params.includeMessages) query.set("includeMessages", "true");
    if (params.companyId) query.set("companyId", params.companyId);

    const res = await fetch(`/api/admin/whatsapp/conversations?${query.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to fetch conversations");
    }
    return json.data || [];
  },

  async getConversation(id: string, companyId?: string): Promise<any> {
    const query = new URLSearchParams();
    if (companyId) query.set("companyId", companyId);
    const res = await fetch(`/api/admin/whatsapp/conversations/${id}?${query.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to fetch conversation");
    }
    return json.data;
  },

  async getMessages(conversationId: string, companyId?: string): Promise<any[]> {
    const query = new URLSearchParams({ conversationId });
    if (companyId) query.set("companyId", companyId);
    const res = await fetch(`/api/admin/whatsapp/messages?${query.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to fetch messages");
    }
    return json.data || [];
  },

  async sendMessage(params: {
    conversationId: string;
    text: string;
    toPhoneNumber?: string;
    companyId?: string;
  }): Promise<any> {
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

  async updateConversationStatus(
    id: string,
    params: {
      status?: string;
      aiHandled?: boolean;
      companyId?: string;
    }
  ): Promise<any> {
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

  async toggleAiHandoff(
    id: string,
    aiHandled: boolean,
    companyId?: string
  ): Promise<any> {
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

  async getSettings(companyId?: string): Promise<any> {
    const query = new URLSearchParams();
    if (companyId) query.set("companyId", companyId);
    const res = await fetch(`/api/admin/whatsapp/settings?${query.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to fetch settings");
    }
    return json.data;
  },

  async saveSettings(data: any): Promise<any> {
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

  async getTemplates(companyId?: string): Promise<any[]> {
    const query = new URLSearchParams();
    if (companyId) query.set("companyId", companyId);
    const res = await fetch(`/api/admin/whatsapp/templates?${query.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to fetch templates");
    }
    return json.data || [];
  },

  async createTemplate(data: any): Promise<any> {
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

  async dispatchBroadcast(data: any): Promise<any> {
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
