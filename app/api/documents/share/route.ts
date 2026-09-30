/**
 * app/api/documents/share/route.ts
 *
 * Universal Multi-Channel Document Sharing Endpoint.
 * Dispatches documents via WhatsApp and/or Email to individual contacts or bulk target groups.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { shareDocuments, ShareDocumentOptions } from "@/lib/documents/sharing";
import { DocumentType } from "@/lib/documents/types";

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const body = await req.json();
    const {
      companyId,
      documentType,
      channel = "BOTH",
      templateId,
      customMessage,
      recipients,
    } = body;

    if (!companyId) {
      return NextResponse.json({ success: false, error: "Missing companyId" }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ success: false, error: "Missing documentType" }, { status: 400 });
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, error: "At least one recipient is required" }, { status: 400 });
    }

    // Tenant authorization check
    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      const userRole = (session.user as any)?.role;
      const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "SYSTEM_ADMIN";
      const hasCompanyAccess = isSuperAdmin || user?.companyId === companyId;

      if (!hasCompanyAccess) {
        return NextResponse.json({ success: false, error: "Unauthorized access to company documents" }, { status: 403 });
      }
    }

    const shareOptions: ShareDocumentOptions = {
      companyId,
      documentType: documentType as DocumentType,
      channel: channel as "WHATSAPP" | "EMAIL" | "BOTH",
      templateId,
      customMessage,
      recipients,
      userId,
    };

    const result = await shareDocuments(shareOptions);

    return NextResponse.json({
      success: true,
      message: `Dispatched to ${result.total} recipients (${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped)`,
      data: result,
    });
  } catch (error: any) {
    console.error("[DOCUMENT_SHARE_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to share documents" },
      { status: 500 }
    );
  }
}
