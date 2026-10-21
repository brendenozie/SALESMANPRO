/**
 * lib/ai/authHelper.ts
 *
 * Secure Authentication and Tenant Isolation Helper for AI APIs.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { AIPlatformError } from "./types";

export interface AuthenticatedAIContext {
  userId: string;
  userEmail: string;
  companyId: string;
  companyName: string;
  role: string;
  isFirstStore?: boolean;
}

export async function resolveAIAuth(req?: Request): Promise<AuthenticatedAIContext> {
  const session = (await getServerSession(authOptions as any)) as {
    user?: { email?: string | null; name?: string | null; id?: string };
  } | null;

  if (!session?.user?.email) {
    throw new AIPlatformError("UNAUTHORIZED", "Authentication required to access AI services", 401);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      role: true,
      companyId: true,
      company: {
        select: { id: true, name: true, deletedAt: true },
      },
    },
  });

  if (!user) {
    throw new AIPlatformError("UNAUTHORIZED", "User record not found", 401);
  }

  // Allow explicit companyId from query/header if user has access or is Admin/Owner
  let targetCompanyId = user.companyId || user.company?.id;

  if (req) {
    const url = new URL(req.url);
    const requestedCompanyId = url.searchParams.get("companyId") || req.headers.get("x-company-id");

    if (requestedCompanyId && requestedCompanyId !== targetCompanyId) {
      // Verify user owns or belongs to requested company
      const company = await prisma.company.findFirst({
        where: {
          id: requestedCompanyId,
          deletedAt: null,
          OR: [
            { userId: user.id },
            { id: user.companyId || "" },
          ],
        },
        select: { id: true, name: true },
      });

      if (company || user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        targetCompanyId = requestedCompanyId;
      }
    }
  }

  if (!targetCompanyId) {
    // Attempt to find any active company owned by user
    const ownedCompany = await prisma.company.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true, name: true },
    });

    if (ownedCompany) {
      targetCompanyId = ownedCompany.id;
    } else {
      // Check if user has zero active stores - allow free first store onboarding
      const ownedCount = await prisma.company.count({
        where: { userId: user.id, deletedAt: null },
      });

      if (ownedCount === 0) {
        return {
          userId: user.id,
          userEmail: user.email,
          companyId: "first_store_onboarding",
          companyName: "First Store Onboarding",
          role: user.role || "USER",
          isFirstStore: true,
        };
      }

      throw new AIPlatformError(
        "TENANT_NOT_FOUND",
        "No active company tenant associated with this account. Please create or join a store to use AI features.",
        403,
      );
    }
  }

  const company = await prisma.company.findUnique({
    where: { id: targetCompanyId },
    select: { id: true, name: true },
  });

  return {
    userId: user.id,
    userEmail: user.email,
    companyId: targetCompanyId,
    companyName: company?.name || "Store",
    role: user.role || "USER",
    isFirstStore: false,
  };
}

export async function requireSuperAdmin(req?: Request): Promise<{
  id: string;
  email: string;
  name?: string | null;
  role: string;
}> {
  const session = (await getServerSession(authOptions as any)) as {
    user?: { email?: string | null; name?: string | null; id?: string };
  } | null;

  if (!session?.user?.email) {
    throw new AIPlatformError("UNAUTHORIZED", "Authentication required", 401);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw new AIPlatformError("UNAUTHORIZED", "User record not found", 401);
  }

  // Super Admin security enforcement
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    throw new AIPlatformError(
      "UNAUTHORIZED",
      "Super Admin privileges required to access this AI control center",
      403,
    );
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
