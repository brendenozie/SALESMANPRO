// /lib/hooks/withApiHandler.ts
import { verifyAuth } from "@/lib/verifyAuth";
import { enforceRateLimit } from "@/lib/hooks/enforceRateLimit";
import { handlePrismaError } from "@/lib/hooks/handlePrismaError";
import { formatResponse } from "@/lib/formatResponse";

type HandlerContext = {
  params: any;
  user?: any;
};

type HandlerFn = (request: Request, context: HandlerContext) => Promise<Response>;

interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireRateLimit?: boolean;
}

/**
 * Unified API wrapper with:
 * - Auth (optional)
 * - Rate limiting (optional)
 * - Prisma + unexpected error handling
 * - Attaches `user` to context for downstream handlers
 */
export function withApiHandler(
  handler: HandlerFn,
  options: ApiHandlerOptions = { requireAuth: true, requireRateLimit: true }
): HandlerFn {
  return async (request: Request, context: HandlerContext) => {
    try {
      // --- Auth
      if (options.requireAuth) {
        const auth = await verifyAuth(request);
        if (!auth.success) {
          return formatResponse(false, null, auth.error, 401);
        }
        context = { ...context, user: auth.user };
      }

      // --- Rate limiting
      if (options.requireRateLimit) {
        const limitResponse = enforceRateLimit(request);
        if (limitResponse) return limitResponse;
      }

      // --- Run actual handler
      return await handler(request, context);
    } catch (error) {
      return handlePrismaError(error);
    }
  };
}
