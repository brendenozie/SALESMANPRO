import type { MetaWebhookMessage } from "@/lib/whatsapp/types";

const DEFAULT_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? "v23.0";

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

      throw new Error(message);
    }

    return body as T;
  }

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

  async sendInteractiveButtons(params: {
    to: string;
    body: string;
    buttons: Array<{
      id: string;
      title: string;
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
            type: "button",

            body: {
              text: params.body,
            },

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

      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
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

            body: {
              text: params.body,
            },

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

            language: {
              code: params.languageCode,
            },

            components: params.components,
          },
        }),
      },
    );
  }

  /**
   * lib/sendWhatsApp.js
   * All WhatsApp Cloud API calls go through this file.
   *
   * Two types of messages:
   *  1. TEMPLATE messages — required for first outbound contact (order confirmations, shipping)
   *  2. SESSION (text) messages — free-form, only allowed within 24hrs of customer's last message
   *
   * WhatsApp API Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages
   */
  
  import { logger } from './logger.js';
  
  const WA_BASE_URL = 'https://graph.facebook.com/v21.0';
  
  /**
   * Core send function — all WA messages go through here.
   */
  async function sendMessage(payload) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_TOKEN;
  
    if (!phoneNumberId || !token) {
      throw new Error('WhatsApp credentials not configured in environment variables');
    }
  
    const url = `${WA_BASE_URL}/${phoneNumberId}/messages`;
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        ...payload,
      }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      logger.error('whatsapp_api_error', {
        status: response.status,
        error: data?.error?.message,
        code: data?.error?.code,
      });
      throw new Error(`WhatsApp API error ${response.status}: ${data?.error?.message}`);
    }
  
    logger.info('whatsapp_message_sent', {
      to: payload.to?.slice(0, 5) + '****',
      type: payload.type,
      messageId: data?.messages?.[0]?.id,
    });
  
    return data;
  }
  
  // ─── Template Messages ──────────────────────────────────────────────────────
  
  /**
   * Sends order confirmation to customer.
   * Template variables: {{1}} = name, {{2}} = orderNumber, {{3}} = total
   */
  export async function sendOrderConfirmation({ phone, name, orderNumber, total }) {
    return sendMessage({
      to: phone,
      type: 'template',
      template: {
        name: process.env.TEMPLATE_ORDER_CONFIRMED || 'order_confirmation',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: name },
              { type: 'text', text: String(orderNumber) },
              { type: 'text', text: String(total) },
            ],
          },
        ],
      },
    });
  }
  
  /**
   * Sends shipping update to customer.
   * Template variables: {{1}} = name, {{2}} = orderNumber, {{3}} = courier, {{4}} = tracking
   */
  export async function sendShippingUpdate({ phone, name, orderNumber, courier, tracking }) {
    return sendMessage({
      to: phone,
      type: 'template',
      template: {
        name: process.env.TEMPLATE_ORDER_SHIPPED || 'shipping_update',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: name },
              { type: 'text', text: String(orderNumber) },
              { type: 'text', text: courier || 'our courier partner' },
              { type: 'text', text: tracking || 'N/A' },
            ],
          },
        ],
      },
    });
  }
  
  /**
   * Sends cancellation notification to customer.
   * Template variables: {{1}} = name, {{2}} = orderNumber
   */
  export async function sendCancellationNotice({ phone, name, orderNumber }) {
    return sendMessage({
      to: phone,
      type: 'template',
      template: {
        name: process.env.TEMPLATE_ORDER_CANCELLED || 'order_cancelled',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: name },
              { type: 'text', text: String(orderNumber) },
            ],
          },
        ],
      },
    });
  }
  
  /**
   * Sends human escalation template to customer.
   * Template variables: {{1}} = name
   */
  export async function sendEscalationTemplate({ phone, name }) {
    return sendMessage({
      to: phone,
      type: 'template',
      template: {
        name: process.env.TEMPLATE_ESCALATION || 'human_escalation',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: name }],
          },
        ],
      },
    });
  }
  
  /**
   * Sends escalation alert to store owner's number.
   * Template variables: {{1}} = customer phone (masked), {{2}} = customer message
   */
  export async function sendOwnerAlert({ customerPhone, customerMessage, customerName }) {
    const ownerPhone = process.env.OWNER_PHONE;
    if (!ownerPhone) {
      logger.warn('owner_alert_skipped', { reason: 'OWNER_PHONE not set' });
      return;
    }
  
    return sendMessage({
      to: ownerPhone,
      type: 'template',
      template: {
        name: process.env.TEMPLATE_ESCALATION_ALERT || 'escalation_alert',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: customerName || 'A customer' },
              { type: 'text', text: customerPhone.slice(0, 5) + '****' },
              { type: 'text', text: customerMessage?.slice(0, 100) || '(no message)' },
            ],
          },
        ],
      },
    });
  }
  
  // ─── Session (Text) Messages ────────────────────────────────────────────────
  // Only valid within 24 hours of the customer's last inbound message to you.
  
  /**
   * Sends a free-form text reply to a customer who messaged within 24hrs.
   */
  export async function sendTextReply({ phone, text }) {
    return sendMessage({
      to: phone,
      type: 'text',
      text: { body: text },
    });
  }
  
  const sendToManyMessage = async (req, res) => {
    const { numbers, templateName, variables, variablesHeader, language, hasDocument, headerFile } = req.body;
  
    const businessNumberId = process.env.BUSINESS_NUMBER_ID;
    const accessToken = process.env.META_API_KEY; 
  
    let headerComponent
  
    if (hasDocument) {
      let name = headerFile.name
      let path = headerFile.path
      let type = 'document'
      // If extension is jpg, jpeg, or png, then it's an image
      if (path.match(/\.(jpg|jpeg|png)$/)) {
        type = 'image';
      }
      headerComponent = {
        type: "header",
        parameters: [
          {
            "type": `${type}`
          }
        ]
      }
      headerComponent.parameters[0][type] = {
        link: `https://localhost:3000/uploads/${name}`
      }
    } else if (variablesHeader.length > 0) {
      headerComponent = {
        type: 'header',
        parameters: variablesHeader.map((variable) => ({
          type: 'text',
          text: variable
        }))
      }
    } else {
      headerComponent = false;
    }
  
    try {
      const sendToAll = numbers.map(async (number) => {
        const payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: number,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: language
            },
            components: [
              {
                type: 'body',
                parameters: variables.map((variable) => ({
                  type: 'text',
                  text: variable
                }))
              }
            ]
          }
        };
  
        if (headerComponent) {
          payload.template.components.unshift(headerComponent);
        }
  
        // Send the request to WhatsApp API
        const response = await axios.post(
          `https://graph.facebook.com/v21.0/${businessNumberId}/messages`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
  
        return response.data;
      });
  
      // Wait for all messages to be sent
      const results = await Promise.all(sendToAll);
      // Return success response
      res.status(200).json({ success: true, results });
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      res.status(500).json({
        success: false,
        error: error.response?.data || 'Failed to send messages'
      });
    }
  };
  
}
