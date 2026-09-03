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
  allowedRoles?: string[]; // Optional: Restrict access to specific roles
  timeoutMs?: number; // Optional request timeout (default: 15,000ms)
}

/* -----------------------------------------
   GLOBAL CORS HEADERS (APPLIED TO ALL ROUTES)
------------------------------------------ */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};

/* -----------------------------------------
   Attach CORS headers & Server-Timing
------------------------------------------ */
function applyCorsAndTiming(response: Response, durationMs: number) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response.headers.set("Server-Timing", `total;dur=${durationMs.toFixed(1)}`);
  return response;
}

/* -----------------------------------------
          MAIN HANDLER WRAPPER
------------------------------------------ */
export function withApiHandler(
  handler: HandlerFn,
  options: ApiHandlerOptions = { requireAuth: true, requireRateLimit: true, allowedRoles: [], timeoutMs: 15_000 },
): HandlerFn {
  const timeoutMs = options.timeoutMs ?? 15_000;

  return async (request: Request, context: HandlerContext) => {
    const startTime = Date.now();
    const url = new URL(request.url);
    const requestPath = url.pathname;

    try {
      // --- OPTIONS (preflight) ---
      if (request.method === "OPTIONS") {
        return applyCorsAndTiming(new Response(null, { status: 204 }), 0);
      }

      // --- Auth ---
      if (options.requireAuth) {
        const auth = await verifyAuth(request);

        if (!auth.success || !auth.user) {
          return applyCorsAndTiming(
            formatResponse(false, null, auth.error || "Unauthorized", 401),
            Date.now() - startTime,
          );
        }

        context = { ...context, user: auth.user };
      }

      // --- Rate Limiting (user-aware when authenticated) ---
      if (options.requireRateLimit) {
        const limitResponse = enforceRateLimit(request, context.user?.id);
        if (limitResponse) return applyCorsAndTiming(limitResponse, Date.now() - startTime);
      }

      // --- Role-based Access Control ---
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        const userRole = context.user?.role?.toLowerCase();
        const allowedRolesLower = options.allowedRoles.map((role) =>
          role.toLowerCase(),
        );

        if (!userRole || !allowedRolesLower.includes(userRole)) {
          return applyCorsAndTiming(
            formatResponse(false, null, "Forbidden: Insufficient role", 403),
            Date.now() - startTime,
          );
        }
      } else if (
        options.requireAuth !== false &&
        requestPath.startsWith("/api/admin") &&
        context.user
      ) {
        const { canAccessDashboard, isConsumerOnlyAccount } = await import("@/lib/auth/authorization");
        if (!canAccessDashboard(context.user) || isConsumerOnlyAccount(context.user)) {
          return applyCorsAndTiming(
            formatResponse(false, null, "Forbidden: Insufficient role", 403),
            Date.now() - startTime,
          );
        }
      }

      // --- Contextual Params ---
      if (!context.params) {
        context.params = {};
      }

      // --- Ensure JSON Content-Type for non-GET requests ---
      if (request.method !== "GET" && request.method !== "OPTIONS") {
        const contentType = request.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
          return applyCorsAndTiming(
            formatResponse(
              false,
              null,
              "Content-Type must be application/json",
              415,
            ),
            Date.now() - startTime,
          );
        }
      }

      // --- Handle Query Parameters ---
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      context.params = { ...context.params, ...queryParams };

      // --- Execute Handler with Timeout Protection ---
      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<Response>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`API_TIMEOUT_${timeoutMs}MS`));
        }, timeoutMs);
      });

      const handlerPromise = handler(request, context);

      const response = await Promise.race([handlerPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      const duration = Date.now() - startTime;
      if (duration > 500 && process.env.NODE_ENV !== "production") {
        console.warn(`[SLOW_API_ROUTE] ${request.method} ${requestPath} completed in ${duration}ms (status: ${response.status})`);
      }

      return applyCorsAndTiming(response, duration);
    
    } catch (error: any) {
      const duration = Date.now() - startTime;
      if (error?.message?.startsWith("API_TIMEOUT")) {
        console.error(`[API_TIMEOUT] ${request.method} ${requestPath} exceeded ${timeoutMs}ms limit`);
        return applyCorsAndTiming(
          formatResponse(false, null, "Request timed out. Downstream operations took too long.", 504),
          duration,
        );
      }
      return applyCorsAndTiming(handlePrismaError(error), duration);
    }
  };
}

