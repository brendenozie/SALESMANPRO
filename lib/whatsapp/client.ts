// lib/whatsapp/client.ts

import { getWhatsAppConfig } from "./config";

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";

function graphUrl(phoneNumberId: string, path: string): string {
  return `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/${path}`;
}

async function whatsappRequest<T>(
  companyId: string | undefined,
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const config = await getWhatsAppConfig(companyId);

  const response = await fetch(graphUrl(config.phoneNumberId, path), {
    method: "POST",

    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify(body),

    cache: "no-store",
  });

  const json = await response.json();

  if (!response.ok) {
    console.error("[WHATSAPP_GRAPH_ERROR]", JSON.stringify(json));

    throw new Error(json?.error?.message || "WhatsApp API request failed");
  }

  return json as T;
}

export async function sendTextMessage(params: {
  companyId?: string;

  to: string;

  text: string;

  previewUrl?: boolean;
}) {
  return whatsappRequest(params.companyId, "messages", {
    messaging_product: "whatsapp",

    recipient_type: "individual",

    to: params.to,

    type: "text",

    text: {
      preview_url: params.previewUrl ?? false,

      body: params.text,
    },
  });
}

export async function markMessageAsRead(params: {
  companyId?: string;

  messageId: string;
}) {
  return whatsappRequest(params.companyId, "messages", {
    messaging_product: "whatsapp",

    status: "read",

    message_id: params.messageId,
  });
}

export async function sendButtonMessage(params: {
  companyId?: string;

  to: string;

  body: string;

  buttons: Array<{
    id: string;
    title: string;
  }>;
}) {
  return whatsappRequest(params.companyId, "messages", {
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
        buttons: params.buttons.map((button) => ({
          type: "reply",

          reply: {
            id: button.id,

            title: button.title.slice(0, 20),
          },
        })),
      },
    },
  });
}

export async function sendListMessage(params: {
  companyId?: string;

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
  return whatsappRequest(params.companyId, "messages", {
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

          rows: section.rows.map((row) => ({
            id: row.id,

            title: row.title.slice(0, 24),

            description: row.description?.slice(0, 72),
          })),
        })),
      },
    },
  });
}

export async function sendImageMessage(params: {
  companyId?: string;

  to: string;

  imageUrl: string;

  caption?: string;
}) {
  return whatsappRequest(params.companyId, "messages", {
    messaging_product: "whatsapp",

    recipient_type: "individual",

    to: params.to,

    type: "image",

    image: {
      link: params.imageUrl,

      caption: params.caption,
    },
  });
}

export async function sendTemplateMessage(params: {
  companyId?: string;

  to: string;

  templateName: string;

  languageCode?: string;

  components?: unknown[];
}) {
  return whatsappRequest(params.companyId, "messages", {
    messaging_product: "whatsapp",

    to: params.to,

    type: "template",

    template: {
      name: params.templateName,

      language: {
        code: params.languageCode || "en",
      },

      components: params.components || [],
    },
  });
}
