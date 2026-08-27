/**
 * lib/whatsapp/normalizePhone.ts
 *
 * Robust phone number normalizer supporting Kenyan formats (07..., 01..., 254..., +254...)
 * and international E.164 formats (standardized without leading '+' for WhatsApp wa_id).
 */

export function normalizePhoneNumber(rawPhone?: string | null): string {
  if (!rawPhone || typeof rawPhone !== "string") {
    return "";
  }

  // Strip all non-digit characters except leading plus if any
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, "");

  // Remove leading plus
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Remove leading 00 international prefix if present (e.g. 00254 -> 254)
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }

  // Handle Kenyan 10-digit mobile prefixes: 07XXXXXXXX, 01XXXXXXXX
  if (/^0[17]\d{8}$/.test(cleaned)) {
    cleaned = "254" + cleaned.substring(1);
  }

  // Handle Kenyan 9-digit mobile numbers missing leading 0 (e.g. 712345678, 112345678)
  if (/^[17]\d{8}$/.test(cleaned)) {
    cleaned = "254" + cleaned;
  }

  return cleaned;
}

/**
 * Validates whether a normalized phone number is valid for WhatsApp / M-Pesa.
 */
export function isValidPhoneNumber(phone?: string | null): boolean {
  if (!phone) return false;
  const normalized = normalizePhoneNumber(phone);
  // Must be between 10 and 15 digits (E.164 specification)
  return /^\d{10,15}$/.test(normalized);
}

/**
 * Formats a normalized phone number for display (e.g., 254712345678 -> +254 712 345 678).
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.startsWith("254") && normalized.length === 12) {
    return `+254 ${normalized.substring(3, 6)} ${normalized.substring(6, 9)} ${normalized.substring(9)}`;
  }
  return `+${normalized}`;
}
