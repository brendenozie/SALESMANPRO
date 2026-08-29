/**
 * Tenant-scoped authentication for WhatsApp admin APIs.
 * Company identity always comes from the authenticated session, never the client body.
 */

import { resolveAIAuth, type AuthenticatedAIContext } from "@/lib/ai/authHelper";
import { formatResponse } from "@/lib/formatResponse";

export type WhatsAppAdminAuth = AuthenticatedAIContext;

export async function requireWhatsAppAdmin(req: Request): Promise<WhatsAppAdminAuth> {
  return resolveAIAuth(req);
}

export function unauthorizedResponse(error: unknown) {
  const status =
    typeof error === "object" && error !== null && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode) || 401
      : 401;
  const message =
    error instanceof Error ? error.message : "Authentication required";
  return formatResponse(false, null, message, status);
}
