/**
 * lib/notifications/authHelper.ts
 *
 * Cross-platform authentication resolver for notifications APIs.
 * Supports NextAuth cookie sessions, JWT token cookies, and Authorization Bearer tokens.
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { decode } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { verifyAuth, VerifiedUser } from "@/lib/verifyAuth";

function getAuthSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "default-salesmanpro-auth-secret-32-chars-min"
  );
}

export async function getAuthenticatedUser(
  request: Request | NextRequest
): Promise<VerifiedUser | null> {
  // 1. Check Bearer Authorization header (Mobile & Desktop clients)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const rawToken = authHeader.substring(7).trim();
    try {
      const decoded = await decode({
        token: rawToken,
        secret: getAuthSecret(),
      });
      if (decoded && decoded.id) {
        return decoded as VerifiedUser;
      }
    } catch {
      // Fallback to cookie verification
    }
  }

  // 2. Check NextAuth cookie via verifyAuth helper
  const authResult = await verifyAuth(request);
  if (authResult.success && authResult.user?.id) {
    return authResult.user;
  }

  // 3. Fallback to getServerSession
  try {
    const session = await getServerSession(authOptions());
    const sessionUser = session?.user as (VerifiedUser & { id?: string }) | undefined;
    if (sessionUser?.id) {
      return sessionUser as VerifiedUser;
    }
  } catch {
    // Ignore session read error
  }

  return null;
}
