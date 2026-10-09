import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { PDFProjectRecord } from "./project-storage";

export interface PDFSessionIdentity {
  userId: string;
  companyId: string;
}

export async function getPDFSessionIdentity(): Promise<PDFSessionIdentity | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; companyId?: string } | undefined;
  if (!user?.id || !user.companyId) return null;
  return { userId: user.id, companyId: user.companyId };
}

export function ownsPDFProject(project: PDFProjectRecord, identity: PDFSessionIdentity): boolean {
  return project.userId === identity.userId && project.companyId === identity.companyId;
}
