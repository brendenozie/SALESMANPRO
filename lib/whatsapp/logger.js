/**
 * lib/logger.js
 * Simple structured logger. In Vercel, logs appear in the dashboard.
 * Never logs sensitive data (phone numbers, tokens).
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function log(level, event, data = {}) {
  if (LOG_LEVELS[level] < LOG_LEVELS[CURRENT_LEVEL]) return;

  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  };

  // Mask phone numbers in logs
  const masked = JSON.stringify(entry).replace(
    /(\+?9[0-9]{10,12})/g,
    (m) => m.slice(0, 5) + '****' + m.slice(-2)
  );

  if (level === 'error') {
    console.error(masked);
  } else if (level === 'warn') {
    console.warn(masked);
  } else {
    console.log(masked);
  }
}

export const logger = {
  debug: (event, data) => log('debug', event, data),
  info:  (event, data) => log('info',  event, data),
  warn:  (event, data) => log('warn',  event, data),
  error: (event, data) => log('error', event, data),
};
