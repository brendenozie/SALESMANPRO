import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

// This interface now reflects the shape of the token
// as defined in your auth.ts jwt callback.
export interface VerifiedUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  bio?: string;
  address?: any; // Use a more specific type if available
  role?: string;
  profilePicture?: string;
  [key: string]: any; // Allows for other properties
}

export interface AuthResult {
  success: boolean;
  authorized?: boolean;
  user?: VerifiedUser;
  error?: string;
}

/**
 * Verifies the user's session from the incoming request cookie using NextAuth's getToken helper.
 * This is the canonical way to verify a NextAuth JWT session in API routes.
 * @param request The incoming Request or NextRequest object.
 * @returns An AuthResult object with success status and user payload or an error.
 */
export async function verifyAuth(request: Request | NextRequest): Promise<AuthResult> {
  try {
    const secret =
      process.env.NEXTAUTH_SECRET ||
      process.env.AUTH_SECRET ||
      "default-salesmanpro-auth-secret-32-chars-min";

    // Primary attempt: try with standard environment-based cookie name
    let token = await getToken({ 
      req: request as any,
      secret,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    });

    // Fallback 1: try alternative cookie name in case production environment received non-prefixed cookie
    if (!token) {
      token = await getToken({
        req: request as any,
        secret,
        cookieName:
          process.env.NODE_ENV === "production"
            ? "next-auth.session-token"
            : "__Secure-next-auth.session-token",
      });
    }

    // Fallback 2: default getToken auto-resolution
    if (!token) {
      token = await getToken({
        req: request as any,
        secret,
      });
    }

    if (!token) {
      return { success: false, authorized: false, error: "Unauthorized: No valid session found" };
    }

    // The 'token' object is the decoded JWT payload.
    // We can cast it to our VerifiedUser interface for type safety.
    const user = token as VerifiedUser;
    if (!user.id && (token as any).sub) {
      user.id = (token as any).sub;
    }

    return { success: true, authorized: true, user: user };

  } catch (error) {
    console.error("Authentication verification failed:", error);
    return { success: false, authorized: false, error: "Internal Server Error during authentication" };
  }
}
