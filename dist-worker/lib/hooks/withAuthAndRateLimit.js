"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuthAndRateLimit = void 0;
// /lib/hooks/withAuthAndRateLimit.ts
const verifyAuth_1 = require("@/lib/verifyAuth");
const enforceRateLimit_1 = require("@/lib/hooks/enforceRateLimit");
const handlePrismaError_1 = require("@/lib/hooks/handlePrismaError");
const formatResponse_1 = require("../formatResponse");
/**
 * Wraps API handlers with auth + rate limiting + error handling.
 *
 * @param handler - Your route's business logic
 * @param options - Optional config (requireAuth, requireRateLimit)
 */
function withAuthAndRateLimit(handler, options = {
    requireAuth: true,
    requireRateLimit: true,
}) {
    return async (request, context) => {
        try {
            // --- Auth check
            if (options.requireAuth) {
                const auth = await (0, verifyAuth_1.verifyAuth)(request);
                if (!auth.success) {
                    return (0, formatResponse_1.formatResponse)(false, null, auth.error, 401);
                }
                const requestPath = new URL(request.url).pathname;
                if (requestPath.startsWith("/api/admin")) {
                    const { canAccessDashboard, isConsumerOnlyAccount } = await Promise.resolve().then(() => __importStar(require("@/lib/auth/authorization")));
                    if (!auth.user || !canAccessDashboard(auth.user) || isConsumerOnlyAccount(auth.user)) {
                        return (0, formatResponse_1.formatResponse)(false, null, "Forbidden: Insufficient role", 403);
                    }
                }
                // attach user to context
                context = { ...context, user: auth.user };
            }
            // --- Rate limit check
            if (options.requireRateLimit) {
                const limitResponse = (0, enforceRateLimit_1.enforceRateLimit)(request);
                if (limitResponse)
                    return limitResponse;
            }
            // --- Execute handler
            return await handler(request, context);
        }
        catch (error) {
            return (0, handlePrismaError_1.handlePrismaError)(error);
        }
    };
}
exports.withAuthAndRateLimit = withAuthAndRateLimit;
