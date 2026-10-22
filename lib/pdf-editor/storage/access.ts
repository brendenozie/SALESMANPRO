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

  if (user?.id) {
    let resolvedCompanyId: string | undefined;

    if (requestedCompanyId) {
      if (isSuperAdmin || requestedCompanyId === user.companyId) {
        resolvedCompanyId = requestedCompanyId;
      } else {
        // Regular users may only act inside a company they own or belong to.
        try {
          const member = await prisma.company.findFirst({
            where: { id: requestedCompanyId, userId: user.id },
            select: { id: true },
          });
          if (member?.id) resolvedCompanyId = member.id;
        } catch {}
      }
    }

    if (!resolvedCompanyId) resolvedCompanyId = user.companyId || undefined;

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
      companyId: resolvedCompanyId || "store_default",
      isSuperAdmin: Boolean(isSuperAdmin),
    };
  }

  // Development / local fallback only. A client-supplied companyId is never
  // accepted as proof of identity outside development.
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
  if (project.isSuperAdminOnly && !identity.isSuperAdmin) return false;
  if (identity.isSuperAdmin) return true;
  return project.companyId === identity.companyId && project.userId === identity.userId;
}
