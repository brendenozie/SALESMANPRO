import { kv } from '@vercel/kv';
import { logger } from './logger.js';

const LIST_KEY = 'wa_responses';

export async function logResponse({ phone, name, orderId, orderNumber, productName, total, response }) {
  const entry = {
    timestamp: new Date().toISOString(),
    phone,
    name,
    orderId,
    orderNumber,
    productName,
    total,
    response,
  };

  try {
    await kv.rpush(LIST_KEY, JSON.stringify(entry));
    logger.info('response_logged', { orderNumber, response });
  } catch (error) {
    logger.error('response_log_failed', { error: error.message });
  }
}

export async function getAllResponses() {
  try {
    const raw = await kv.lrange(LIST_KEY, 0, -1);
    return raw.map((r) => (typeof r === 'string' ? JSON.parse(r) : r));
  } catch (error) {
    logger.error('response_fetch_failed', { error: error.message });
    return [];
  }
}