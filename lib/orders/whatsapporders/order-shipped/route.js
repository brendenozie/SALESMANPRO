/**
 * app/api/order-shipped/route.js
 * Shopify webhook: fires when an order is fulfilled (marked as shipped).
 *
 * Shopify Admin Setup:
 *   Event: Order fulfillment
 *   URL: https://YOUR-APP.vercel.app/api/order-shipped
 *   Format: JSON
 */

import { verifyShopifyWebhook } from '../../../lib/verifyShopify.js';
import { sendShippingUpdate }   from '../../../lib/sendWhatsApp.js';
import { normalizePhone }       from '../../../lib/phoneFormat.js';
import { logger }               from '../../../lib/logger.js';

const processedFulfillments = new Set();

export async function POST(request) {
  // ── 1. Read raw body & verify HMAC ──────────────────────────────────────
  const rawBody = await request.text().catch(() => null);
  if (!rawBody) return new Response('Cannot read body', { status: 400 });

  const hmac = request.headers.get('x-shopify-hmac-sha256');
  if (!verifyShopifyWebhook(rawBody, hmac)) {
    logger.warn('invalid_shopify_hmac', { endpoint: 'order-shipped' });
    return new Response('Unauthorized', { status: 401 });
  }

  // ── 2. Parse fulfillment data ────────────────────────────────────────────
  let fulfillment;
  try {
    fulfillment = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const fulfillmentId = fulfillment.id;
  const orderId       = fulfillment.order_id;

  // ── 3. Idempotency check ─────────────────────────────────────────────────
  const key = `${orderId}-${fulfillmentId}`;
  if (processedFulfillments.has(key)) {
    logger.info('fulfillment_duplicate_skipped', { key });
    return new Response('OK', { status: 200 });
  }
  processedFulfillments.add(key);
  if (processedFulfillments.size > 500) processedFulfillments.clear();

  // ── 4. Extract details ───────────────────────────────────────────────────
  // Note: Fulfillment webhook includes limited order data.
  // The order's customer info comes from fulfillment.destination or order_id.
  const destination  = fulfillment.destination || {};
  const firstName    = destination.first_name || 'Customer';
  const rawPhone     = destination.phone;
  const countryCode  = destination.country_code || 'PK';
  // order_number (#1042) is preferred but may not be in fulfillment payload — fall back to order_id
  const orderNumber  = fulfillment.order_number || `#${fulfillment.order_id}`;
  const tracking     = fulfillment.tracking_number || null;
  const courier      = fulfillment.tracking_company || 'our courier';

  logger.info('order_shipped_received', { orderId, fulfillmentId, hasPhone: !!rawPhone, hasTracking: !!tracking });

  if (!rawPhone) {
    logger.warn('fulfillment_no_phone', { orderId });
    return new Response('OK - no phone', { status: 200 });
  }

  const phone = normalizePhone(rawPhone, countryCode);
  if (!phone) {
    logger.warn('fulfillment_invalid_phone', { orderId });
    return new Response('OK - invalid phone', { status: 200 });
  }

  // ── 5. Send shipping update ──────────────────────────────────────────────
  try {
    await sendShippingUpdate({
      phone,
      name: firstName,
      orderNumber,
      courier,
      tracking: tracking || 'Will be updated soon',
    });

    logger.info('shipping_update_sent', { orderId });
    return new Response('OK', { status: 200 });

  } catch (error) {
    logger.error('shipping_update_failed', { orderId, error: error.message });
    return new Response('OK - WhatsApp error logged', { status: 200 });
  }
}
