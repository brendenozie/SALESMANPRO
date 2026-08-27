<<<<<<< HEAD
=======
/**
 * lib/whatsapp/metaClient.ts
 *
 * Production Meta WhatsApp Cloud API Client.
 * Supports text, images, documents, audio, interactive buttons,
 * interactive lists, message templates, status updates, and order/payment notifications.
 */

>>>>>>> c00ac535 (Fresh initialization and recovery)
const DEFAULT_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0";
const GRAPH_BASE =
  process.env.WHATSAPP_GRAPH_BASE_URL ??
  `https://graph.facebook.com/${DEFAULT_GRAPH_VERSION}`;

export interface MetaWhatsAppClientOptions {
  accessToken: string;
  phoneNumberId: string;
<<<<<<< HEAD
=======
  timeoutMs?: number;
>>>>>>> c00ac535 (Fresh initialization and recovery)
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
<<<<<<< HEAD

  constructor(options: MetaWhatsAppClientOptions) {
    if (!options.accessToken || !options.phoneNumberId) {
      throw new Error("WhatsApp credentials not configured properly");
    }
    this.accessToken = options.accessToken;
    this.phoneNumberId = options.phoneNumberId;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${GRAPH_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        body?.error?.message ??
        `Meta WhatsApp API request failed with status ${response.status}`;
      console.error("whatsapp_api_error", {
        status: response.status,
        error: message,
        code: body?.error?.code,
      });
      throw new Error(message);
    }

    return body as T;
=======
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
>>>>>>> c00ac535 (Fresh initialization and recovery)
  }

  // ─── Standard Messages ──────────────────────────────────────────────────────

  async sendTextMessage(params: {
    to: string;
    body: string;
    previewUrl?: boolean;
<<<<<<< HEAD
  }) {
=======
  }): Promise<MetaSendMessageResponse> {
>>>>>>> c00ac535 (Fresh initialization and recovery)
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
<<<<<<< HEAD
  }) {
=======
  }): Promise<MetaSendMessageResponse> {
>>>>>>> c00ac535 (Fresh initialization and recovery)
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
<<<<<<< HEAD
  }) {
=======
  }): Promise<MetaSendMessageResponse> {
>>>>>>> c00ac535 (Fresh initialization and recovery)
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

<<<<<<< HEAD
  // ─── Interactive Messages ───────────────────────────────────────────────────

  async sendInteractiveButtons(params: {
    to: string;
    body: string;
    buttons: Array<{ id: string; title: string }>;
  }) {
=======
  async sendAudioMessage(params: {
    to: string;
    audioUrl: string;
  }): Promise<MetaSendMessageResponse> {
>>>>>>> c00ac535 (Fresh initialization and recovery)
    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: params.to,
<<<<<<< HEAD
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: params.body },
            action: {
              buttons: params.buttons.slice(0, 3).map((button) => ({
                type: "reply",
                reply: {
                  id: button.id,
                  title: button.title.slice(0, 20),
                },
              })),
            },
=======
          type: "audio",
          audio: {
            link: params.audioUrl,
>>>>>>> c00ac535 (Fresh initialization and recovery)
          },
        }),
      },
    );
  }

<<<<<<< HEAD
=======
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

>>>>>>> c00ac535 (Fresh initialization and recovery)
  async sendListMessage(params: {
    to: string;
    body: string;
    buttonText: string;
<<<<<<< HEAD
=======
    header?: { type: "text"; text: string };
    footer?: string;
>>>>>>> c00ac535 (Fresh initialization and recovery)
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
<<<<<<< HEAD
  }) {
=======
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

>>>>>>> c00ac535 (Fresh initialization and recovery)
    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
<<<<<<< HEAD
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: params.to,
          type: "interactive",
          interactive: {
            type: "list",
            body: { text: params.body },
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
        }),
=======
        body: JSON.stringify(payload),
>>>>>>> c00ac535 (Fresh initialization and recovery)
      },
    );
  }

<<<<<<< HEAD
=======
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

>>>>>>> c00ac535 (Fresh initialization and recovery)
  // ─── Template Messages ──────────────────────────────────────────────────────

  async sendTemplateMessage(params: {
    to: string;
    templateName: string;
    languageCode: string;
    components?: unknown[];
<<<<<<< HEAD
  }) {
=======
  }): Promise<MetaSendMessageResponse> {
>>>>>>> c00ac535 (Fresh initialization and recovery)
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

<<<<<<< HEAD
  // ─── Pre-Configured Store Templates ─────────────────────────────────────────

  async sendOrderConfirmation({
    phone,
    name,
    orderNumber,
    total,
  }: {
    phone: string;
    name: string;
    orderNumber: string | number;
    total: string | number;
  }) {
    return this.sendTemplateMessage({
      to: phone,
      templateName:
        process.env.TEMPLATE_ORDER_CONFIRMED || "order_confirmation",
      languageCode: "en_US",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: name },
            { type: "text", text: String(orderNumber) },
            { type: "text", text: String(total) },
          ],
        },
      ],
    });
  }

  async sendShippingUpdate({
    phone,
    name,
    orderNumber,
    courier,
    tracking,
  }: {
    phone: string;
    name: string;
    orderNumber: string | number;
    courier?: string;
    tracking?: string;
  }) {
    return this.sendTemplateMessage({
      to: phone,
      templateName: process.env.TEMPLATE_ORDER_SHIPPED || "shipping_update",
      languageCode: "en_US",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: name },
            { type: "text", text: String(orderNumber) },
            { type: "text", text: courier || "our courier partner" },
            { type: "text", text: tracking || "N/A" },
          ],
        },
      ],
    });
  }

  async sendCancellationNotice({
    phone,
    name,
    orderNumber,
  }: {
    phone: string;
    name: string;
    orderNumber: string | number;
  }) {
    return this.sendTemplateMessage({
      to: phone,
      templateName: process.env.TEMPLATE_ORDER_CANCELLED || "order_cancelled",
      languageCode: "en_US",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: name },
            { type: "text", text: String(orderNumber) },
          ],
        },
      ],
    });
  }

  async sendEscalationTemplate({
    phone,
    name,
  }: {
    phone: string;
    name: string;
  }) {
    return this.sendTemplateMessage({
      to: phone,
      templateName: process.env.TEMPLATE_ESCALATION || "human_escalation",
      languageCode: "en",
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: name }],
        },
      ],
    });
  }

  async sendOwnerAlert({
    customerPhone,
    customerMessage,
    customerName,
  }: {
    customerPhone: string;
    customerMessage?: string;
    customerName?: string;
  }) {
    const ownerPhone = process.env.OWNER_PHONE;
    if (!ownerPhone) {
      console.warn("owner_alert_skipped: OWNER_PHONE not set");
      return null;
    }

    return this.sendTemplateMessage({
      to: ownerPhone,
      templateName: process.env.TEMPLATE_ESCALATION_ALERT || "escalation_alert",
      languageCode: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: customerName || "A customer" },
            { type: "text", text: customerPhone.slice(0, 5) + "****" },
            {
              type: "text",
              text: customerMessage?.slice(0, 100) || "(no message)",
            },
          ],
        },
      ],
    });
  }

  // ─── Batch / Broadcast Messages ─────────────────────────────────────────────

  async sendBatchTemplateMessages(params: {
    numbers: string[];
    templateName: string;
    language: string;
    variables: string[];
    variablesHeader?: string[];
    hasDocument?: boolean;
    headerFile?: { name: string; path: string };
  }) {
    const {
      numbers,
      templateName,
      variables,
      variablesHeader = [],
      language,
      hasDocument,
      headerFile,
    } = params;

    let headerComponent: any = undefined;

    if (hasDocument && headerFile) {
      const { name, path } = headerFile;
      let type = "document";
      if (path.match(/\.(jpg|jpeg|png)$/i)) {
        type = "image";
      }

      headerComponent = {
        type: "header",
        parameters: [
          {
            type,
            [type]: {
              link: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/uploads/${name}`,
            },
          },
        ],
      };
    } else if (variablesHeader.length > 0) {
      headerComponent = {
        type: "header",
        parameters: variablesHeader.map((variable) => ({
          type: "text",
          text: variable,
        })),
      };
    }

    const components: any[] = [
      {
        type: "body",
        parameters: variables.map((variable) => ({
          type: "text",
          text: variable,
        })),
      },
    ];

    if (headerComponent) {
      components.unshift(headerComponent);
    }

    const sendPromises = numbers.map((number) =>
      this.sendTemplateMessage({
        to: number,
        templateName,
        languageCode: language,
        components,
      }).catch((err) => ({ error: err.message, number })),
    );

    return Promise.all(sendPromises);
  }
=======
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
>>>>>>> c00ac535 (Fresh initialization and recovery)
}
