/**
 * lib/keywords.js
 * Keyword detection and auto-reply system.
 * Checked BEFORE sending to Groq AI — instant responses for common queries.
 *
 * Keywords are case-insensitive and match even if surrounded by other text.
 */

import { logger } from './logger.js';

const storeName = process.env.STORE_NAME || 'us';

// ─── Keyword Definitions ────────────────────────────────────────────────────
// Each entry: { patterns: [regex], reply: string, action?: string }
// action: 'escalate' tells the caller to trigger human handoff

const KEYWORDS = [
  {
    id: 'confirm',
    patterns: [/^confirm$/i, /^yes$/i, /^ok$/i, /^okay$/i],
    reply: `✅ Perfect! Your order is confirmed and we're getting it ready. We'll send you a shipping update as soon as it's on the way!`,
  },
  {
    id: 'cancel',
    patterns: [/\bcancel\b/i, /\brefund\b/i],
    reply: `We're sorry to hear that! To cancel your order, please note:\n\n• Orders can only be cancelled within 1 hour of placing them.\n• For cancellations or refunds after shipping, reply RETURN.\n\nOr reply HUMAN to speak with our team directly.`,
  },
  {
    id: 'status',
    patterns: [/\bstatus\b/i, /\bwhere.*order\b/i, /\btrack\b/i, /\bdelivery\b/i],
    reply: `📦 To check your order status, please visit our website or share your order number and we'll look it up for you! You'll also receive an automatic update when your order ships.`,
  },
  {
    id: 'return',
    patterns: [/\breturn\b/i, /\bexchange\b/i],
    reply: `🔄 Our return policy:\n\n• 7-day return window from delivery date.\n• Items must be unused and in original packaging.\n• Reply HUMAN to start the return process with our team.`,
  },
  {
    id: 'help',
    patterns: [/^help$/i, /^hi$/i, /^hello$/i, /^hii+$/i, /^hey$/i, /^assalamu?/i],
    reply: `👋 Hi! Welcome to ${storeName} support. Here's what I can help with:\n\n• CONFIRM — confirm your order\n• STATUS — check order status\n• CANCEL — cancel an order\n• RETURN — returns & exchanges\n• HUMAN — speak with our team\n\nWhat can I help you with today?`,
  },
  {
    id: 'human',
    patterns: [/\bhuman\b/i, /\bagent\b/i, /\breal person\b/i, /\bsupport team\b/i],
    reply: `👤 Connecting you to our support team right away! Someone will be with you shortly. Thank you for your patience! 🙏`,
    action: 'escalate',
  },
];

/**
 * Checks a message against all keywords.
 * @param {string} message
 * @returns {{ matched: boolean, reply: string|null, action: string|null, keywordId: string|null }}
 */
export function checkKeyword(message) {
  if (!message) return { matched: false, reply: null, action: null, keywordId: null };

  const trimmed = message.trim();

  for (const kw of KEYWORDS) {
    const matched = kw.patterns.some((pattern) => pattern.test(trimmed));
    if (matched) {
      logger.info('keyword_matched', { keyword: kw.id });
      return {
        matched: true,
        reply: kw.reply,
        action: kw.action || null,
        keywordId: kw.id,
      };
    }
  }

  return { matched: false, reply: null, action: null, keywordId: null };
}

/**
 * Fallback reply when both keyword check and AI fail.
 */
export function getFallbackReply(customerName) {
  const name = customerName ? `, ${customerName}` : '';
  return `Hi${name}! Thanks for reaching out to ${storeName}. We've received your message and our team will get back to you shortly. Reply HELP to see quick options.`;
}
