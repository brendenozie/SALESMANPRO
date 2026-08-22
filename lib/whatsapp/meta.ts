import { getWhatsAppConfig } from "./config";

interface SendTextOptions {
  to: string;
  text: string;
  previewUrl?: boolean;
}


export async function sendTenantWhatsAppText({
  phoneNumberId,
  accessToken,
  to,
  text,
}: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  text: string;
}) {
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";

  const url =
    `https://graph.facebook.com/` +
    `${graphVersion}/` +
    `${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${accessToken}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      messaging_product: "whatsapp",

      recipient_type: "individual",

      to,

      type: "text",

      text: {
        preview_url: false,
        body: text,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "WhatsApp send failed");
  }

  return result;
}



export async function sendWhatsAppText({
  to,
  text,
  previewUrl = false,
}: SendTextOptions) {
  const config = getWhatsAppConfig();

  const url =
    `https://graph.facebook.com/` +
    `${config.graphVersion}/` +
    `${config.phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: previewUrl,
        body: text,
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    console.error("[WHATSAPP_SEND_ERROR]", payload);

    throw new Error(
      payload?.error?.message || "Failed to send WhatsApp message",
    );
  }

  return payload;
}
