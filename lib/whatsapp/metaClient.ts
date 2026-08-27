/**
 * lib/whatsapp/metaClient.ts
 *
 * Production Meta WhatsApp Cloud API Client.
 * Supports text, images, documents, audio, interactive buttons,
 * interactive lists, message templates, status updates, and order/payment notifications.
 */

const DEFAULT_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0";
const GRAPH_BASE =
  process.env.WHATSAPP_GRAPH_BASE_URL ??
  `https://graph.facebook.com/${DEFAULT_GRAPH_VERSION}`;

export interface MetaWhatsAppClientOptions {
  accessToken: string;
  phoneNumberId: string;
  timeoutMs?: number;
}

export interface MetaSendMessageResponse {
  messaging_product?: "whatsapp";
  contacts?: Array<{
    input?: string;
    wa_id?: string;
  }>;
  messages?: Array<{
    id?: string;
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

export class MetaWhatsAppClient {
  private readonly accessToken: string;
  private readonly phoneNumberId: string;
  private readonly timeoutMs: number;

  constructor(options: MetaWhatsAppClientOptions) {
    if (!options.accessToken || !options.phoneNumberId) {
      throw new Error(
        "WhatsApp credentials missing: accessToken and phoneNumberId are required.",
      );
    }
    this.accessToken = options.accessToken;
    this.phoneNumberId = options.phoneNumberId;
    this.timeoutMs = options.timeoutMs ?? 15000;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${GRAPH_BASE}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          body?.error?.message ??
          `Meta WhatsApp API request failed with HTTP ${response.status}`;
        console.error("[META_WHATSAPP_API_ERROR]", {
          status: response.status,
          error: errorMsg,
          code: body?.error?.code,
          subcode: body?.error?.error_subcode,
          path,
        });
        throw new Error(errorMsg);
      }

      return body as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Meta WhatsApp API timeout after ${this.timeoutMs}ms on ${path}`,
        );
      }
      throw error;
    }
  }

  // ─── Standard Messages ──────────────────────────────────────────────────────

  async sendTextMessage(params: {
    to: string;
    body: string;
    previewUrl?: boolean;
  }): Promise<MetaSendMessageResponse> {
    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: params.to,
          type: "text",
          text: {
            preview_url: params.previewUrl ?? false,
            body: params.body,
          },
        }),
      },
    );
  }

  async sendImageMessage(params: {
    to: string;
    imageUrl: string;
    caption?: string;
  }): Promise<MetaSendMessageResponse> {
    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: params.to,
          type: "image",
          image: {
            link: params.imageUrl,
            caption: params.caption,
          },
        }),
      },
    );
  }

  async sendDocumentMessage(params: {
    to: string;
    documentUrl: string;
    filename?: string;
    caption?: string;
  }): Promise<MetaSendMessageResponse> {
    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: params.to,
          type: "document",
          document: {
            link: params.documentUrl,
            filename: params.filename,
            caption: params.caption,
          },
        }),
      },
    );
  }

  async sendAudioMessage(params: {
    to: string;
    audioUrl: string;
  }): Promise<MetaSendMessageResponse> {
    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: params.to,
          type: "audio",
          audio: {
            link: params.audioUrl,
          },
        }),
      },
    );
  }

  // ─── Interactive Messages ───────────────────────────────────────────────────

  async sendInteractiveButtons(params: {
    to: string;
    body: string;
    header?: { type: "text"; text: string };
    footer?: string;
    buttons: Array<{ id: string; title: string }>;
  }): Promise<MetaSendMessageResponse> {
    const payload: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: params.to,
      type: "interactive",
      interactive: {
        type: "button",
        ...(params.header ? { header: params.header } : {}),
        body: { text: params.body },
        ...(params.footer ? { footer: { text: params.footer } } : {}),
        action: {
          buttons: params.buttons.slice(0, 3).map((button) => ({
            type: "reply",
            reply: {
              id: button.id,
              title: button.title.slice(0, 20),
            },
          })),
        },
      },
    };

    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  async sendListMessage(params: {
    to: string;
    body: string;
    buttonText: string;
    header?: { type: "text"; text: string };
    footer?: string;
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
  }): Promise<MetaSendMessageResponse> {
    const payload: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: params.to,
      type: "interactive",
      interactive: {
        type: "list",
        ...(params.header ? { header: params.header } : {}),
        body: { text: params.body },
        ...(params.footer ? { footer: { text: params.footer } } : {}),
        action: {
          button: params.buttonText.slice(0, 20),
          sections: params.sections.map((section) => ({
            title: section.title?.slice(0, 24),
            rows: section.rows.slice(0, 10).map((row) => ({
              id: row.id,
              title: row.title.slice(0, 24),
              description: row.description?.slice(0, 72),
            })),
          })),
        },
      },
    };

    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  }

  // ─── Status & Read Receipts ─────────────────────────────────────────────────

  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      await this.request(`/${this.phoneNumberId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  // ─── Template Messages ──────────────────────────────────────────────────────

  async sendTemplateMessage(params: {
    to: string;
    templateName: string;
    languageCode: string;
    components?: unknown[];
  }): Promise<MetaSendMessageResponse> {
    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: params.to,
          type: "template",
          template: {
            name: params.templateName,
            language: { code: params.languageCode },
            components: params.components,
          },
        }),
      },
    );
  }

  // ─── High-Level Notifications ───────────────────────────────────────────────

  async sendOrderConfirmation(params: {
    phone: string;
    name: string;
    trackingNumber: string;
    total: number;
    currency?: string;
    itemsSummary?: string;
  }): Promise<MetaSendMessageResponse> {
    const currency = params.currency ?? "KES";
    const formattedTotal = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
    }).format(params.total);

    const body = [
      `🎉 *Order Confirmed!*`,
      ``,
      `Hello ${params.name}, your order has been received.`,
      ``,
      `📦 *Tracking #:* ${params.trackingNumber}`,
      `💰 *Total:* ${formattedTotal}`,
      params.itemsSummary ? `📋 *Items:* ${params.itemsSummary}` : "",
      ``,
      `We will notify you once your order is on the way!`,
    ]
      .filter(Boolean)
      .join("\n");

    return this.sendTextMessage({
      to: params.phone,
      body,
    });
  }

  async sendPaymentReceivedNotification(params: {
    phone: string;
    trackingNumber: string;
    receiptNumber: string;
    amount: number;
    currency?: string;
  }): Promise<MetaSendMessageResponse> {
    const currency = params.currency ?? "KES";
    const formattedAmount = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
    }).format(params.amount);

    const body = [
      `✅ *Payment Received Successfully!*`,
      ``,
      `Your payment of *${formattedAmount}* for Order *#${params.trackingNumber}* has been confirmed.`,
      `🧾 *Receipt:* ${params.receiptNumber}`,
      ``,
      `Thank you for shopping with us!`,
    ].join("\n");

    return this.sendTextMessage({
      to: params.phone,
      body,
    });
  }
}
