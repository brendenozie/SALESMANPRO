// /lib/hooks/withAuthAndRateLimit.ts
import { verifyAuth } from "@/lib/verifyAuth";
import { enforceRateLimit } from "@/lib/hooks/enforceRateLimit";
import { handlePrismaError } from "@/lib/hooks/handlePrismaError";
import { formatResponse } from "../formatResponse";

/**
 * Wraps API handlers with auth + rate limiting + error handling.
 *
 * @param handler - Your route's business logic
 * @param options - Optional config (requireAuth, requireRateLimit)
 */
export function withAuthAndRateLimit<T = any>(
  handler: (request: Request, context: { params: any; user?: any }) => Promise<Response>,
  options: { requireAuth?: boolean; requireRateLimit?: boolean } = {
    requireAuth: true,
    requireRateLimit: true,
  }
) {
  return async (request: Request, context: { params: any; user?: any }) => {
    try {
      // --- Auth check
      if (options.requireAuth) {
        const auth = await verifyAuth(request);
        if (!auth.success) {
          return formatResponse(false, null, auth.error, 401);
        }
        // attach user to context
        context = { ...context, user: auth.user };
      }

      // --- Rate limit check
      if (options.requireRateLimit) {
        const limitResponse = enforceRateLimit(request);
        if (limitResponse) return limitResponse;
      }

      // --- Execute handler
      return await handler(request, context);
    } catch (error: unknown) {
      return handlePrismaError(error);
    }
  };
}
