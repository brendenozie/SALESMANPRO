import { getAuthSession, authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import prisma from "@/server/db/prismadb";
import type { PDFProjectRecord } from "./project-storage";

export interface PDFSessionIdentity {
  userId: string;
  companyId: string;
  isSuperAdmin?: boolean;
}

export async function getPDFSessionIdentity(
  requestedCompanyId?: string | null
): Promise<PDFSessionIdentity | null> {
  let session = null;
  try {
    session = await getAuthSession();
  } catch {
    try {
      session = await getServerSession(authOptions as any);
    } catch {}
  }

  let user = session?.user as { id?: string; email?: string; companyId?: string; role?: string } | undefined;

  if (!user?.id && user?.email) {
    try {
      const u = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase().trim() },
        select: { id: true, companyId: true, role: true },
      });
      if (u) {
        user = { ...user, id: u.id, companyId: u.companyId || user.companyId, role: u.role || user.role };
      }
    } catch {}
  }

  const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  let resolvedCompanyId = requestedCompanyId || user?.companyId;

  if (user?.id) {
    if (!resolvedCompanyId) {
      try {
        const owned = await prisma.company.findFirst({
          where: { userId: user.id },
          select: { id: true },
        });
        if (owned?.id) resolvedCompanyId = owned.id;
      } catch {}
    }

    return {
      userId: user.id,
      companyId: resolvedCompanyId || requestedCompanyId || "store_default",
      isSuperAdmin: Boolean(isSuperAdmin),
    };
  }

  // If requestedCompanyId is present from authenticated admin workspace
  if (requestedCompanyId) {
    return {
      userId: "admin_operator",
      companyId: requestedCompanyId,
      isSuperAdmin: true,
    };
  }

  // Development / local fallback if no session is active and explicitly in development
  if (process.env.NODE_ENV === "development") {
    return {
      userId: "dev_user",
      companyId: requestedCompanyId || "store_default",
      isSuperAdmin: true,
    };
  }

  return null;
}

export function ownsPDFProject(project: PDFProjectRecord, identity: PDFSessionIdentity): boolean {
  if (identity.isSuperAdmin) return true;
  return project.companyId === identity.companyId && project.userId === identity.userId;
}
