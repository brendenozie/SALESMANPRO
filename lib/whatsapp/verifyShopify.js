/**
 * lib/verifyShopify.js
 * Verifies that incoming webhooks are genuinely from Shopify.
 * Uses HMAC-SHA256 with your Shopify webhook secret.
 *
 * SECURITY CRITICAL — never skip this check.
 * Without it, anyone can POST fake orders to your endpoint.
 */

import crypto from 'crypto';

/**
 * Verifies the HMAC signature on a Shopify webhook.
 * @param {string} rawBody       - Raw request body as a string (NOT parsed JSON)
 * @param {string} hmacHeader    - Value of x-shopify-hmac-sha256 header
 * @returns {boolean}
 */
export function verifyShopifyWebhook(rawBody, hmacHeader) {
  if (!hmacHeader) return false;

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('SHOPIFY_WEBHOOK_SECRET is not set in environment variables');
    return false;
  }

  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  // timingSafeEqual prevents timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedHash),
      Buffer.from(hmacHeader)
    );
  } catch {
    return false;
  }
}
