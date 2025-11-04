import type { NextApiRequest } from "next";
import cookie from "cookie";

/**
 * Safe cookie getter that works in both App and Pages environments.
 * You can pass `req` if available (like in API routes or NextAuth callbacks),
 * or it falls back to reading `process.env` (in server contexts).
 */
export function getCallbackCookie(req?: NextApiRequest): string | null {
  try {
    if (req?.headers?.cookie) {
      const parsed = cookie.parse(req.headers.cookie || "");
      return parsed["nextauth_callback_url"] || null;
    }

    if (typeof document !== "undefined") {
      // On the client
      const parsed = cookie.parse(document.cookie || "");
      return parsed["nextauth_callback_url"] || null;
    }

    return null;
  } catch {
    return null;
  }
}
