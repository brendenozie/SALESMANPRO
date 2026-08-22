/**
 * lib/phoneFormat.js
 * Normalizes phone numbers to E.164 format required by WhatsApp Cloud API.
 * Handles Pakistani numbers by default — extend countryDefaults for other markets.
 */

const countryDefaults = {
  // Add more as needed: 'PK' -> '92', 'AE' -> '971', etc.
  PK: '92',
  US: '1',
  GB: '44',
  AE: '971',
  IN: '91',
};

/**
 * Converts any phone format to WhatsApp-ready format (no + sign, with country code).
 * @param {string} phone  - Raw phone from Shopify order
 * @param {string} country - 2-letter country code from order (e.g. 'PK')
 * @returns {string|null}  - Normalized phone or null if invalid
 */
export function normalizePhone(phone, country = 'PK') {
  if (!phone) return null;

  // Strip everything except digits and leading +
  let cleaned = phone.replace(/[\s\-().]/g, '');

  // Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // If starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    const code = countryDefaults[country] || countryDefaults['PK'];
    cleaned = code + cleaned.slice(1);
  }

  // Must be between 7-15 digits
  if (!/^\d{7,15}$/.test(cleaned)) {
    return null;
  }

  return cleaned; // WhatsApp API format: no + sign
}

/**
 * Formats phone for display (masks middle digits for privacy in logs).
 */
export function maskPhone(phone) {
  if (!phone || phone.length < 6) return '****';
  return phone.slice(0, 4) + '****' + phone.slice(-2);
}
