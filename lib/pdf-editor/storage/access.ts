import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    session = await getServerSession(authOptions as any);
  } catch {
    try {
      session = await getServerSession((authOptions as any)());
    } catch {}
  }

  const user = session?.user as { id?: string; companyId?: string; role?: string } | undefined;

  if (user?.id) {
    let resolvedCompanyId = user.companyId || requestedCompanyId;
    const isSuperAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";

    // If companyId is not on the user session, look up their company in database
    if (!resolvedCompanyId) {
      try {
        const owned = await prisma.company.findFirst({
          where: { userId: user.id },
          select: { id: true },
        });
        if (owned?.id) resolvedCompanyId = owned.id;
      } catch {}
    }

    // If requestedCompanyId is provided and differs, verify relationship or admin rights
    if (requestedCompanyId && isSuperAdmin) {
      resolvedCompanyId = requestedCompanyId;
    }

    if (resolvedCompanyId) {
      return {
        userId: user.id,
        companyId: resolvedCompanyId,
        isSuperAdmin,
      };
    }
  }

  // Development / local fallback if no session is active
  if (process.env.NODE_ENV !== "production") {
    return {
      userId: user?.id || "dev_user",
      companyId: requestedCompanyId || user?.companyId || "store_default",
      isSuperAdmin: true,
    };
  }

  return null;
}

export function ownsPDFProject(project: PDFProjectRecord, identity: PDFSessionIdentity): boolean {
  if (identity.isSuperAdmin) return true;
  return project.companyId === identity.companyId || project.userId === identity.userId;
}
