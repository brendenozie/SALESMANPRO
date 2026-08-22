/**
 * app/api/order-placed/route.js
 * Shopify webhook: fires when a new order is placed.
 *
 * Shopify Admin Setup:
 *   Event: Order creation
 *   URL: https://YOUR-APP.vercel.app/api/order-placed
 *   Format: JSON
 */

import { verifyShopifyWebhook } from '../../../lib/verifyShopify.js';
import { sendOrderConfirmation } from '../../../lib/sendWhatsApp.js';
import { normalizePhone }        from '../../../lib/phoneFormat.js';
import { saveOrderLink }         from '../../../lib/orderStore.js';
import { logger }                from '../../../lib/logger.js';

// In-memory dedup set (clears on cold start — good enough for Vercel)
const processedOrders = new Set();

export async function POST(request) {
  // ── 1. Read raw body for HMAC verification ──────────────────────────────
  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return new Response('Cannot read body', { status: 400 });
  }

  // ── 2. Verify the request is genuinely from Shopify ──────────────────────
  const hmac = request.headers.get('x-shopify-hmac-sha256');
  if (!verifyShopifyWebhook(rawBody, hmac)) {
    logger.warn('invalid_shopify_hmac', { endpoint: 'order-placed' });
    return new Response('Unauthorized', { status: 401 });
  }

  // ── 3. Parse order data ──────────────────────────────────────────────────
  let order;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const orderId     = order.id;
  const orderNumber = order.order_number || order.name || orderId;

  // ── 4. Idempotency check — skip if already processed ────────────────────
  if (processedOrders.has(String(orderId))) {
    logger.info('order_duplicate_skipped', { orderId });
    return new Response('OK', { status: 200 });
  }
  processedOrders.add(String(orderId));
  // Keep set from growing unbounded on long-running instances
  if (processedOrders.size > 500) processedOrders.clear();

  // ── 5. Extract customer details ──────────────────────────────────────────
  const customer    = order.customer || {};
  const address     = order.billing_address || order.shipping_address || {};
  const firstName   = customer.first_name || address.first_name || 'Customer';
  const rawPhone    = customer.phone || address.phone || order.phone;
  const countryCode = address.country_code || 'PK';

  const totalPrice  = `${order.currency || 'PKR'} ${order.total_price || '0'}`;
  const lineItems   = (order.line_items || [])
    .map((i) => `${i.quantity}x ${i.title}`)
    .join(', ');

  logger.info('order_placed_received', {
    orderId,
    orderNumber,
    hasPhone: !!rawPhone,
    country: countryCode,
    itemCount: order.line_items?.length,
  });

  // ── 6. Validate and normalize phone ─────────────────────────────────────
  if (!rawPhone) {
    logger.warn('order_no_phone', { orderId, orderNumber });
    // Still return 200 — Shopify should not retry for a data issue
    return new Response('OK - no phone', { status: 200 });
  }

  const phone = normalizePhone(rawPhone, countryCode);
  if (!phone) {
    logger.warn('order_invalid_phone', { orderId, orderNumber });
    return new Response('OK - invalid phone', { status: 200 });
  }

  // ── 7. Send WhatsApp confirmation ────────────────────────────────────────
  try {
    await sendOrderConfirmation({
      phone,
      name: firstName,
      orderNumber,
      total: totalPrice,
      items: lineItems,
    });

    // Store order context so the reply webhook can attribute the customer's
    // answer to this order. saveOrderLink swallows its own errors.
    await saveOrderLink({
      phone,
      orderId,
      orderNumber,
      productName: lineItems,
      total: totalPrice,
    });

    logger.info('order_confirmation_sent', { orderId, orderNumber });
    return new Response('OK', { status: 200 });

  } catch (error) {
    logger.error('order_confirmation_failed', {
      orderId,
      orderNumber,
      error: error.message,
    });
    // Return 200 anyway — don't let Shopify retry on WhatsApp failures
    return new Response('OK - WhatsApp error logged', { status: 200 });
  }
}
