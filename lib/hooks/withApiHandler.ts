import { verifyAuth, VerifiedUser } from "@/lib/verifyAuth"; // Import VerifiedUser
import { enforceRateLimit } from "@/lib/hooks/enforceRateLimit";
import { handlePrismaError } from "@/lib/hooks/handlePrismaError";
import { formatResponse } from "@/lib/formatResponse";

// Update the HandlerContext to use the specific VerifiedUser type
type HandlerContext = {
  params: any;
  user?: VerifiedUser; // Use the imported type here
};

type HandlerFn = (request: Request, context: HandlerContext) => Promise<Response>;

interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireRateLimit?: boolean;
}

/**
 * Unified API wrapper with:
 * - Auth (optional) using NextAuth's session cookie
 * - Rate limiting (optional)
 * - Prisma + unexpected error handling
 * - Attaches a typed `user` object to the context for downstream handlers
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

        if (!auth.success || !auth.user) { // Also check if auth.user exists
          return formatResponse(false, null, auth.error || "Unauthorized", 401);
        }
        
        // The user object is now strongly typed as VerifiedUser
        context = { ...context, user: auth.user };
      }

      // --- Rate limiting
      if (options.requireRateLimit) {
        const limitResponse = enforceRateLimit(request);
        if (limitResponse) return limitResponse;
      }

      // --- Run actual handler
      // We need to assert that context.user is defined if auth is required.
      // The check above ensures this, but TypeScript might not infer it.
      return await handler(request, context);
      
    } catch (error) {
      return handlePrismaError(error);
    }
  };
}
