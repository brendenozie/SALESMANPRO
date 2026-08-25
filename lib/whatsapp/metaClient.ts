const DEFAULT_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0";
const GRAPH_BASE =
  process.env.WHATSAPP_GRAPH_BASE_URL ??
  `https://graph.facebook.com/${DEFAULT_GRAPH_VERSION}`;

export interface MetaWhatsAppClientOptions {
  accessToken: string;
  phoneNumberId: string;
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
  }

  // ─── Standard Messages ──────────────────────────────────────────────────────

  async sendTextMessage(params: {
    to: string;
    body: string;
    previewUrl?: boolean;
  }) {
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
  }) {
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
  }) {
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

  // ─── Interactive Messages ───────────────────────────────────────────────────

  async sendInteractiveButtons(params: {
    to: string;
    body: string;
    buttons: Array<{ id: string; title: string }>;
  }) {
    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: params.to,
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
          },
        }),
      },
    );
  }

  async sendListMessage(params: {
    to: string;
    body: string;
    buttonText: string;
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
  }) {
    return this.request<MetaSendMessageResponse>(
      `/${this.phoneNumberId}/messages`,
      {
        method: "POST",
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
      },
    );
  }

  // ─── Template Messages ──────────────────────────────────────────────────────

  async sendTemplateMessage(params: {
    to: string;
    templateName: string;
    languageCode: string;
    components?: unknown[];
  }) {
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
}
