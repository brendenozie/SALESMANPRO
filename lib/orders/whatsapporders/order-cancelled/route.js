/**
 * app/api/order-cancelled/route.js
 * Shopify webhook: fires when an order is cancelled.
 *
 * Shopify Admin Setup:
 *   Event: Order cancellation
 *   URL: https://YOUR-APP.vercel.app/api/order-cancelled
 *   Format: JSON
 */

import { verifyShopifyWebhook }   from '../../../lib/verifyShopify.js';
import { sendCancellationNotice } from '../../../lib/sendWhatsApp.js';
import { normalizePhone }         from '../../../lib/phoneFormat.js';
import { logger }                 from '../../../lib/logger.js';

const processedCancellations = new Set();

export async function POST(request) {
  const rawBody = await request.text().catch(() => null);
  if (!rawBody) return new Response('Cannot read body', { status: 400 });

  const hmac = request.headers.get('x-shopify-hmac-sha256');
  if (!verifyShopifyWebhook(rawBody, hmac)) {
    logger.warn('invalid_shopify_hmac', { endpoint: 'order-cancelled' });
    return new Response('Unauthorized', { status: 401 });
  }

  let order;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const orderId     = order.id;
  const orderNumber = order.order_number || order.name || orderId;

  if (processedCancellations.has(String(orderId))) {
    logger.info('cancellation_duplicate_skipped', { orderId });
    return new Response('OK', { status: 200 });
  }
  processedCancellations.add(String(orderId));
  if (processedCancellations.size > 500) processedCancellations.clear();

  const customer  = order.customer || {};
  const address   = order.billing_address || order.shipping_address || {};
  const firstName = customer.first_name || address.first_name || 'Customer';
  const rawPhone  = customer.phone || address.phone || order.phone;
  const country   = address.country_code || 'PK';

  logger.info('order_cancelled_received', { orderId, orderNumber, hasPhone: !!rawPhone });

  if (!rawPhone) return new Response('OK - no phone', { status: 200 });

  const phone = normalizePhone(rawPhone, country);
  if (!phone) return new Response('OK - invalid phone', { status: 200 });

  try {
    await sendCancellationNotice({ phone, name: firstName, orderNumber });
    logger.info('cancellation_notice_sent', { orderId });
    return new Response('OK', { status: 200 });
  } catch (error) {
    logger.error('cancellation_notice_failed', { orderId, error: error.message });
    return new Response('OK - WhatsApp error logged', { status: 200 });
  }
}
