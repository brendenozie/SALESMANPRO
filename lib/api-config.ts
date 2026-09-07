/**
 * Canonical API configuration for SalesmanPro.
 * Ensures that client-side requests are ALWAYS same-origin relative (`/api`),
 * preventing cross-origin CORS issues and avoiding Private Network Access (PNA)
 * attempts against `localhost` or `127.0.0.1`.
 */

export const API_BASE_URL = "/api";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return API_BASE_URL;
  }
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL.replace(/\/$/, "");
  }
  return API_BASE_URL;
}

export default getApiBaseUrl;
