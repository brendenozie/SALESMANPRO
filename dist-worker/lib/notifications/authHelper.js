"use strict";
/**
 * lib/notifications/authHelper.ts
 *
 * Cross-platform authentication resolver for notifications APIs.
 * Supports NextAuth cookie sessions, JWT token cookies, and Authorization Bearer tokens.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatedUser = void 0;
const next_auth_1 = require("next-auth");
const jwt_1 = require("next-auth/jwt");
const auth_1 = require("@/lib/auth");
const verifyAuth_1 = require("@/lib/verifyAuth");
function getAuthSecret() {
    return (process.env.NEXTAUTH_SECRET ||
        process.env.AUTH_SECRET ||
        "default-salesmanpro-auth-secret-32-chars-min");
}
async function getAuthenticatedUser(request) {
    // 1. Check Bearer Authorization header (Mobile & Desktop clients)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const rawToken = authHeader.substring(7).trim();
        try {
            const decoded = await (0, jwt_1.decode)({
                token: rawToken,
                secret: getAuthSecret(),
            });
            if (decoded && decoded.id) {
                return decoded;
            }
        }
        catch {
            // Fallback to cookie verification
        }
    }
    // 2. Check NextAuth cookie via verifyAuth helper
    const authResult = await (0, verifyAuth_1.verifyAuth)(request);
    if (authResult.success && authResult.user?.id) {
        return authResult.user;
    }
    // 3. Fallback to getServerSession
    try {
        const session = await (0, next_auth_1.getServerSession)((0, auth_1.authOptions)());
        const sessionUser = session?.user;
        if (sessionUser?.id) {
            return sessionUser;
        }
    }
    catch {
        // Ignore session read error
    }
    return null;
}
exports.getAuthenticatedUser = getAuthenticatedUser;
