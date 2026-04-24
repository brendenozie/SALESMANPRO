import { verifyAuth, VerifiedUser } from "@/lib/verifyAuth";
import { enforceRateLimit } from "@/lib/hooks/enforceRateLimit";
import { handlePrismaError } from "@/lib/hooks/handlePrismaError";
import { formatResponse } from "@/lib/formatResponse";

type HandlerContext = {
  params: any;
  user?: VerifiedUser;
};

type HandlerFn = (
  request: Request,
  context: HandlerContext,
) => Promise<Response>;

interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireRateLimit?: boolean;
}

/* -----------------------------------------
   GLOBAL CORS HEADERS (APPLIED TO ALL ROUTES)
------------------------------------------ */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
};

/* -----------------------------------------
   Attach CORS headers to any response
------------------------------------------ */
function applyCors(response: Response) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/* -----------------------------------------
          MAIN HANDLER WRAPPER
------------------------------------------ */
export function withApiHandler(
  handler: HandlerFn,
  options: ApiHandlerOptions = { requireAuth: true, requireRateLimit: true },
): HandlerFn {
  return async (request: Request, context: HandlerContext) => {
    try {
      // --- OPTIONS (preflight) ---
      if (request.method === "OPTIONS") {
        return applyCors(new Response(null, { status: 204 }));
      }

      // --- Auth ---
      if (options.requireAuth) {
        const auth = await verifyAuth(request);

        if (!auth.success || !auth.user) {
          return applyCors(
            formatResponse(false, null, auth.error || "Unauthorized", 401),
          );
        }

        context = { ...context, user: auth.user };
      }

      // --- Rate Limiting ---
      if (options.requireRateLimit) {
        const limitResponse = enforceRateLimit(request);
        if (limitResponse) return applyCors(limitResponse);
      }

      // --- Run actual API handler ---
      const response = await handler(request, context);

      return applyCors(response);
    } catch (error) {
      return applyCors(handlePrismaError(error));
    }
  };
}
