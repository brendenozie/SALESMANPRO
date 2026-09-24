"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuth = void 0;
const jwt_1 = require("next-auth/jwt");
/**
 * Verifies the user's session from the incoming request cookie using NextAuth's getToken helper.
 * This is the canonical way to verify a NextAuth JWT session in API routes.
 * @param request The incoming Request or NextRequest object.
 * @returns An AuthResult object with success status and user payload or an error.
 */
async function verifyAuth(request) {
    try {
        // The `getToken` helper from `next-auth/jwt` is designed to read and decrypt
        // the JWT stored in the session cookie. It uses the NEXTAUTH_SECRET automatically.
        const token = await (0, jwt_1.getToken)({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            // secureCookie: true, // Force secure cookies in production, but allow non-secure in development
            cookieName: process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
        });
        if (!token) {
            return { success: false, authorized: false, error: "Unauthorized: No valid session found" };
        }
        // The 'token' object is the decoded JWT payload.
        // We can cast it to our VerifiedUser interface for type safety.
        const user = token;
        return { success: true, authorized: true, user: user };
    }
    catch (error) {
        console.error("Authentication verification failed:", error);
        return { success: false, authorized: false, error: "Internal Server Error during authentication" };
    }
}
exports.verifyAuth = verifyAuth;
