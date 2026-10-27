import { NextResponse } from "next/server";
import { getCurrentPOSSession } from "@/lib/pos/posSessionService";
import { formatResponse } from "@/lib/formatResponse";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { PosSessionStatus } from "@prisma/client";
import type { POSOperatorInfo, POSSessionInfo } from "@/types/pos";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const terminalId = searchParams.get("terminalId") || "T01";

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId query parameter", 400);
    }

    const session = await getCurrentPOSSession(companyId, terminalId);
    return formatResponse(true, session, "Active session retrieved", 200);
  } catch (error: any) {
    console.error("[POS_SESSION_GET_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to get POS session", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return formatResponse(false, null, "Unauthorized: Please sign in", 401);
    }

    const body = await req.json().catch(() => ({}));
    const { companyId, terminalId = "T01", openingBalance = 0 } = body;

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId", 400);
    }

    // 1. Verify user has access to this store/company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, userId: true, name: true },
    });

    if (!company) {
      return formatResponse(false, null, "Store / Company not found", 404);
    }

    const isOwner = company.userId === session.user.id;
    const staff = await prisma.staffProfile.findFirst({
      where: { companyId, userId: session.user.id, employmentStatus: "ACTIVE" },
    });

    const userRole = (session.user as any)?.role?.toUpperCase();
    const isAuthorized = isOwner || !!staff || userRole === "ADMIN" || userRole === "SUPERADMIN";

    if (!isAuthorized) {
      return formatResponse(false, null, "Access denied: Not authorized for this store POS", 403);
    }

    // 2. Look for an existing OPEN POS session on this terminal
    let activeSession = await prisma.posSession.findFirst({
      where: {
        companyId,
        terminalId,
        status: PosSessionStatus.OPEN,
      },
      include: {
        operator: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { openedAt: "desc" },
    });

    if (!activeSession) {
      activeSession = await prisma.posSession.create({
        data: {
          companyId,
          operatorId: session.user.id,
          staffProfileId: staff?.id || undefined,
          terminalId,
          status: PosSessionStatus.OPEN,
          shiftStatus: "OPEN",
          openingBalance: Number(openingBalance) || 0,
          openedAt: new Date(),
        },
        include: {
          operator: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });
    }

    const operatorInfo: POSOperatorInfo = {
      id: session.user.id,
      name: session.user.name || (isOwner ? "Store Owner" : "Staff Member"),
      email: session.user.email,
      role: staff?.posRole || (isOwner ? "OWNER" : "ADMIN"),
      jobTitle: staff?.jobTitle || (isOwner ? "Store Owner" : "Administrator"),
      staffProfileId: staff?.id,
      permissions: staff?.posPermissions && staff.posPermissions.length > 0
        ? staff.posPermissions
        : [
            "POS_ACCESS",
            "POS_OPEN_SESSION",
            "POS_CLOSE_SESSION",
            "POS_CREATE_ORDER",
            "POS_DISCOUNT",
            "POS_SPLIT_BILL",
            "POS_TRANSFER_TABLE",
          ],
    };

    const sessionInfo: POSSessionInfo = {
      id: activeSession.id,
      terminalId: activeSession.terminalId,
      status: activeSession.status,
      shiftStatus: activeSession.shiftStatus || "OPEN",
      openedAt: activeSession.openedAt,
      openingBalance: activeSession.openingBalance,
      totalSales: activeSession.totalSales,
      totalTransactions: activeSession.totalTransactions,
    };

    return formatResponse(
      true,
      { operator: operatorInfo, posSession: sessionInfo, session: activeSession },
      "POS Session started successfully",
      200
    );
  } catch (error: any) {
    console.error("[POS_SESSION_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to start POS session", 500);
  }
}

