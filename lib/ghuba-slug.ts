/**
 * lib/ghuba-slug.ts
 *
 * Secure, SEO-friendly slug and public token generation for Ghuba marketplace listings.
 * Protects underlying MongoDB ObjectIDs from enumeration, scraping, and exposure,
 * while maintaining 100% backward compatibility with legacy raw ObjectIDs.
 */

const DEFAULT_SALT = "ghuba_marketplace_sec_salt_2026_x9f8k2";

/**
 * Generates a simple pseudorandom keystream from a string salt.
 */
function createKeystream(salt: string, length: number): Uint8Array {
  const stream = new Uint8Array(length);
  let hash = 0x811c9dc5;
  for (let i = 0; i < salt.length; i++) {
    hash ^= salt.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  let state = hash >>> 0;
  for (let i = 0; i < length; i++) {
    // Xorshift32 PRNG
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    stream[i] = (state ^ (i * 37)) & 0xff;
  }
  return stream;
}

/**
 * 2-byte Fletcher-16 checksum
 */
function checksum16(data: Uint8Array): [number, number] {
  let sum1 = 0;
  let sum2 = 0;
  for (let i = 0; i < data.length; i++) {
    sum1 = (sum1 + data[i]) % 255;
    sum2 = (sum2 + sum1) % 255;
  }
  return [sum1, sum2];
}

/**
 * Encodes binary buffer to URL-safe base64 string without padding.
 */
function bufferToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa === "function") {
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return Buffer.from(binary, "binary")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decodes URL-safe base64 string to Uint8Array.
 */
function base64UrlToBuffer(str: string): Uint8Array | null {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    let binary: string;
    if (typeof atob === "function") {
      binary = atob(base64);
    } else {
      binary = Buffer.from(base64, "base64").toString("binary");
    }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

/**
 * Encodes a 24-character hex MongoDB ObjectId into an unguessable, URL-safe public token.
 */
export function encodeListingId(id: string, salt: string = DEFAULT_SALT): string {
  if (!id || typeof id !== "string") return "";
  const cleanId = id.trim();
  if (!/^[0-9a-fA-F]{24}$/.test(cleanId)) {
    // If not a valid 24-hex ObjectId, return as-is
    return cleanId;
  }

  // Convert 24-char hex to 12 bytes
  const bytes = new Uint8Array(12);
  for (let i = 0; i < 12; i++) {
    bytes[i] = parseInt(cleanId.substr(i * 2, 2), 16);
  }

  // Calculate 2-byte checksum
  const [c1, c2] = checksum16(bytes);
  const payload = new Uint8Array(14);
  payload.set(bytes, 0);
  payload[12] = c1;
  payload[13] = c2;

  // Mask payload with keystream
  const keystream = createKeystream(salt, 14);
  for (let i = 0; i < 14; i++) {
    payload[i] ^= keystream[i];
  }

  return bufferToBase64Url(payload);
}

/**
 * Decodes a public token back into the underlying 24-character hex MongoDB ObjectId.
 * Returns null if token is invalid or checksum fails.
 */
export function decodeListingId(token: string, salt: string = DEFAULT_SALT): string | null {
  if (!token || typeof token !== "string") return null;
  const clean = token.trim();

  // If already a raw 24-hex ObjectId, return directly
  if (/^[0-9a-fA-F]{24}$/.test(clean)) {
    return clean;
  }

  const payload = base64UrlToBuffer(clean);
  if (!payload || payload.length !== 14) {
    return null;
  }

  // Unmask with keystream
  const keystream = createKeystream(salt, 14);
  for (let i = 0; i < 14; i++) {
    payload[i] ^= keystream[i];
  }

  // Verify checksum
  const bytes = payload.subarray(0, 12);
  const [c1, c2] = checksum16(bytes);
  if (payload[12] !== c1 || payload[13] !== c2) {
    return null;
  }

  // Convert 12 bytes back to 24-hex string
  let hex = "";
  for (let i = 0; i < 12; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Slugifies a title/name for human and SEO friendly URLs.
 */
export function slugifyTitle(title?: string | null): string {
  if (!title) return "product";
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Collapse whitespace and underscores to hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens

  return slug || "product";
}

/**
 * Generates the full public URL path for a product listing.
 * Example: /ghuba/productlist/toyota-land-cruiser-prado--mQ7v1_xK9pL2a1
 */
export function getListingPublicUrl(listing: {
  id: string;
  name?: string | null;
  title?: string | null;
  make?: string | null;
  model?: string | null;
  [key: string]: any;
}): string {
  if (!listing || !listing.id) return "/ghuba/productlist";
  const title = (listing.make && listing.model ? `${listing.make} ${listing.model}` : listing.name || listing.title) || "";
  const slug = slugifyTitle(title);
  const token = encodeListingId(listing.id);

  return `/ghuba/productlist/${slug}--${token}`;
}

/**
 * Extracts and resolves the 24-hex MongoDB ObjectId from any incoming route parameter.
 * Handles:
 * 1. Semantic slug + secure token: "toyota-prado--mQ7v1_xK9pL2a1" -> decoded ID
 * 2. Raw 24-hex ObjectId: "664a38f123456789abcdef01" -> "664a38f123456789abcdef01"
 * 3. Semantic slug + raw ID: "toyota-prado-664a38f123456789abcdef01" -> "664a38f123456789abcdef01"
 * 4. Token only: "mQ7v1_xK9pL2a1" -> decoded ID
 */
export function extractListingId(param: string): string {
  if (!param || typeof param !== "string") return "";
  const raw = decodeURIComponent(param.trim());

  // 1. Direct raw 24-hex ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(raw)) {
    return raw;
  }

  // 2. Double-hyphen delimiter format: slug--token
  if (raw.includes("--")) {
    const parts = raw.split("--");
    const candidate = parts[parts.length - 1];

    // Try decoding candidate as token
    const decoded = decodeListingId(candidate);
    if (decoded) return decoded;

    // Check if candidate is raw 24-hex ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(candidate)) {
      return candidate;
    }
  }

  // 3. Single-hyphen ending with 24-hex ObjectId (e.g. slug-664a38f123456789abcdef01)
  const trailingHexMatch = raw.match(/[0-9a-fA-F]{24}$/);
  if (trailingHexMatch) {
    return trailingHexMatch[0];
  }

  // 4. Try decoding raw parameter directly as a token
  const decodedDirect = decodeListingId(raw);
  if (decodedDirect) {
    return decodedDirect;
  }

  // 5. Check if the last segment after hyphen is a token
  const segments = raw.split("-");
  if (segments.length > 1) {
    const lastSeg = segments[segments.length - 1];
    const decodedLast = decodeListingId(lastSeg);
    if (decodedLast) return decodedLast;
  }

  // Fallback to raw string
  return raw;
}
