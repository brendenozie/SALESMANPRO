/**
 * app/api/whatsapp-webhook/route.js
 * Handles ALL incoming WhatsApp interactions:
 *   GET  — Meta's webhook verification challenge (one-time setup)
 *   POST — Incoming customer messages (ongoing)
 *
 * Meta Developer Console Setup:
 *   Callback URL: https://YOUR-APP.vercel.app/api/whatsapp-webhook
 *   Verify Token: (must match WHATSAPP_VERIFY_TOKEN in your .env.local)
 *   Subscribe to: messages
 */

import { sendTextReply, sendEscalationTemplate, sendOwnerAlert } from '../../../lib/sendWhatsApp.js';
import { generateAIReply }   from '../../../lib/groqReply.js';
import { checkKeyword, getFallbackReply } from '../../../lib/keywords.js';
import { getOrderLink }      from '../../../lib/orderStore.js';
import { logResponse }       from '../../../lib/responseLog.js';
import { logger }            from '../../../lib/logger.js';

// ─── GET — Webhook Verification ─────────────────────────────────────────────
// Meta calls this ONCE when you register your webhook URL.
// It passes a challenge token that you must echo back.

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode      = searchParams.get('hub.mode');
  const token     = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  logger.info('whatsapp_webhook_verify_attempt', { mode, tokenMatch: token === process.env.WHATSAPP_VERIFY_TOKEN });

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('whatsapp_webhook_verified');
    return new Response(challenge, { status: 200 });
  }

  logger.warn('whatsapp_webhook_verify_failed');
  return new Response('Forbidden', { status: 403 });
}

// ─── POST — Incoming Customer Messages ──────────────────────────────────────

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // WhatsApp sends many event types — only handle actual messages
  if (body.object !== 'whatsapp_business_account') {
    return new Response('OK', { status: 200 });
  }

  try {
    const entry   = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value   = changes?.value;

    // Status updates (delivered, read) — acknowledge and ignore
    if (value?.statuses) {
      return new Response('OK', { status: 200 });
    }

    const messages = value?.messages;
    if (!messages || messages.length === 0) {
      return new Response('OK', { status: 200 });
    }

    const message     = messages[0];
    const fromPhone   = message.from;          // Customer's phone number
    const messageType = message.type;          // 'text', 'image', 'audio', etc.

    // Get contact info from the contacts array
    const contacts    = value?.contacts || [];
    const contact     = contacts.find((c) => c.wa_id === fromPhone) || {};
    const customerName = contact?.profile?.name || 'Customer';

    logger.info('incoming_message', {
      type: messageType,
      fromMasked: fromPhone?.slice(0, 5) + '****',
      name: customerName,
    });

    // ── Only process text messages ────────────────────────────────────────
    if (messageType !== 'text') {
      await sendTextReply({
        phone: fromPhone,
        text: `Hi ${customerName}! I can only read text messages right now. Reply HELP to see what I can do, or HUMAN to speak with our team.`,
      });
      return new Response('OK', { status: 200 });
    }

    const incomingText = message.text?.body?.trim() || '';

    if (!incomingText) {
      return new Response('OK', { status: 200 });
    }

    // ── Step 0: Record the reply against its order (feeds /api/export-orders)
    // Must await: Vercel freezes the function once the response is returned.
    // Both calls swallow their own errors, so this cannot break the reply path.
    const order = (await getOrderLink(fromPhone)) || {};
    await logResponse({
      phone: fromPhone,
      name: customerName,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      productName: order.productName,
      total: order.total,
      response: incomingText,
    });

    // ── Step 1: Check keyword shortcuts first (instant response) ─────────
    const { matched, reply: keywordReply, action } = checkKeyword(incomingText);

    if (matched) {
      // Send the keyword reply
      await sendTextReply({ phone: fromPhone, text: keywordReply });

      // If escalation action triggered, also notify the owner
      if (action === 'escalate') {
        logger.info('escalation_triggered', { reason: 'keyword_HUMAN' });

        await sendOwnerAlert({
          customerPhone: fromPhone,
          customerMessage: incomingText,
          customerName,
        }).catch((err) => {
          logger.error('owner_alert_failed', { error: err.message });
        });
      }

      return new Response('OK', { status: 200 });
    }

    // ── Step 2: Send to Groq AI for intelligent response ──────────────────
    logger.info('routing_to_ai', { messageLength: incomingText.length });

    const aiReply = await generateAIReply({
      customerMessage: incomingText,
      customerName,
      orderNumber: order.orderNumber ?? null,
    });

    if (aiReply) {
      await sendTextReply({ phone: fromPhone, text: aiReply });
      return new Response('OK', { status: 200 });
    }

    // ── Step 3: AI failed — escalate to human + send fallback ─────────────
    logger.warn('ai_failed_escalating', { fromMasked: fromPhone?.slice(0, 5) + '****' });

    const fallback = getFallbackReply(customerName);
    await sendTextReply({ phone: fromPhone, text: fallback });

    await sendOwnerAlert({
      customerPhone: fromPhone,
      customerMessage: incomingText,
      customerName,
    }).catch((err) => {
      logger.error('owner_alert_failed_on_ai_failure', { error: err.message });
    });

    return new Response('OK', { status: 200 });

  } catch (error) {
    logger.error('whatsapp_webhook_error', { error: error.message, stack: error.stack });
    // Always return 200 to prevent Meta from retrying indefinitely
    return new Response('OK', { status: 200 });
  }
}
