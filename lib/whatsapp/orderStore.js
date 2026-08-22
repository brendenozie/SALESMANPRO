/**
 * lib/orderStore.js
 * Saves order details to Vercel KV when a confirmation is sent,
 * and retrieves them when a customer taps Confirm/Cancel.
 *
 * Key format:  order_link:<phone>
 * TTL:         48 hours (so old orders auto-expire)
 */

import { kv } from '@vercel/kv';
import { logger } from './logger.js';

const TTL_SECONDS = 48 * 60 * 60; // 48 hours

/**
 * Call this right after sending the order confirmation message.
 * Stores the order details so we can look them up when the customer replies.
 */
export async function saveOrderLink({ phone, orderId, orderNumber, productName, total }) {
  const key = `order_link:${phone}`;
  const data = { phone, orderId, orderNumber, productName, total };

  try {
    await kv.set(key, JSON.stringify(data), { ex: TTL_SECONDS });
    logger.info('order_link_saved', { orderNumber, phone: phone?.slice(0, 5) + '****' });
  } catch (error) {
    logger.error('order_link_save_failed', { error: error.message, orderNumber });
  }
}

/**
 * Call this when a customer taps a button.
 * Returns the saved order object, or null if not found / expired.
 */
export async function getOrderLink(phone) {
  const key = `order_link:${phone}`;

  try {
    const raw = await kv.get(key);
    if (!raw) return null;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (error) {
    logger.error('order_link_fetch_failed', { error: error.message });
    return null;
  }
}