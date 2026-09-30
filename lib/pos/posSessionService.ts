import prisma from "@/server/db/prismadb";
import { PosSessionStatus } from "@prisma/client";
import { hashPOSCode } from "./posStaffService";
import type { AuthenticatedOperatorResult, POSOperatorInfo, POSSessionInfo } from "@/types/pos";

// In-memory rate limiting map for POS login code attempts: key -> { attempts: number, lockUntil: number }
const loginAttempts = new Map<string, { attempts: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export interface AuthenticateOperatorInput {
  companyId: string;
  loginCode: string;
  terminalId?: string;
  openingBalance?: number;
}

export async function authenticatePOSOperator(
  input: AuthenticateOperatorInput
): Promise<AuthenticatedOperatorResult> {
  const { companyId, loginCode, terminalId = "T01", openingBalance = 0 } = input;

  if (!companyId) {
    throw new Error("Company context is required for POS operator authentication");
  }

  const cleanCode = (loginCode || "").trim();
  if (!cleanCode) {
    throw new Error("Login code is required");
  }

  // Rate-limiting check per company & terminal
  const rateLimitKey = `${companyId}:${terminalId}:${cleanCode.slice(0, 3)}`;
  const now = Date.now();
  const attemptRecord = loginAttempts.get(rateLimitKey);

  if (attemptRecord && attemptRecord.lockUntil > now) {
    const remainingSec = Math.ceil((attemptRecord.lockUntil - now) / 1000);
    throw new Error(`Too many failed login attempts. Terminal locked for ${remainingSec} seconds.`);
  }

  const hashedCode = hashPOSCode(cleanCode);

  // 1. Look up StaffProfile scoped to companyId by hashed PIN or plaintext loginCode
  const staff = await prisma.staffProfile.findFirst({
    where: {
      companyId,
      OR: [
        { codeHash: hashedCode },
        { loginCode: cleanCode },
      ],
    },
    include: {
      user: true,
    },
  });

  let user: any = null;
  let jobTitle = "Staff Member";
  let role = "CASHIER";
  let permissions: string[] = [
    "POS_ACCESS",
    "POS_OPEN_SESSION",
    "POS_CLOSE_SESSION",
    "POS_CREATE_ORDER",
    "POS_DISCOUNT",
  ];
  let staffProfileId: string | undefined = undefined;

  if (staff) {
    // Check employment and POS activation status
    if (staff.employmentStatus !== "ACTIVE") {
      throw new Error("Access denied: Staff profile is inactive or disabled");
    }

    if (staff.isPosActive === false) {
      throw new Error("Access denied: Staff POS access is deactivated");
    }

    if (staff.codeExpiresAt && staff.codeExpiresAt < new Date()) {
      throw new Error("Access denied: Staff login code has expired");
    }

    if (!staff.user) {
      throw new Error("Access denied: No active user associated with this staff profile");
    }

    if (staff.user.isActive === false || staff.user.deletedAt !== null) {
      throw new Error("Access denied: User account is deactivated");
    }

    user = staff.user;
    jobTitle = staff.jobTitle || "Staff Member";
    role = staff.posRole || staff.jobTitle || "CASHIER";
    permissions = staff.posPermissions && staff.posPermissions.length > 0
      ? staff.posPermissions
      : [
          "POS_ACCESS",
          "POS_OPEN_SESSION",
          "POS_CLOSE_SESSION",
          "POS_CREATE_ORDER",
          "POS_DISCOUNT",
          "POS_SPLIT_BILL",
          "POS_TRANSFER_TABLE",
        ];
    staffProfileId = staff.id;

    // Track usage timestamp
    await prisma.staffProfile.update({
      where: { id: staff.id },
      data: { codeLastUsedAt: new Date() },
    }).catch(() => null);
  } else {
    // 2. Check cross-tenant isolation
    const otherStoreStaff = await prisma.staffProfile.findFirst({
      where: {
        OR: [
          { codeHash: hashedCode },
          { loginCode: cleanCode },
        ],
        companyId: { not: companyId },
      },
    });

    if (otherStoreStaff) {
      throw new Error("Access denied: This login code is not authorized for this store/company");
    }

    // 3. Fallback: check SalesAgent in this company
    const salesAgent = await prisma.salesAgent.findFirst({
      where: {
        loginCode: cleanCode,
        companyId,
      },
      include: {
        user: true,
      },
    });

    if (salesAgent) {
      if (!salesAgent.isActive) {
        throw new Error("Access denied: Agent account is inactive or disabled");
      }
      if (salesAgent.user && (salesAgent.user.isActive === false || salesAgent.user.deletedAt !== null)) {
        throw new Error("Access denied: User account is deactivated");
      }
      user = salesAgent.user;
      jobTitle = "Sales Agent";
      role = "AGENT";
    }
  }

  if (!user) {
    // Increment failed attempt counter
    const currentAttempts = (attemptRecord?.attempts || 0) + 1;
    if (currentAttempts >= MAX_ATTEMPTS) {
      loginAttempts.set(rateLimitKey, { attempts: currentAttempts, lockUntil: now + LOCKOUT_MS });
      throw new Error("Too many failed attempts. Terminal temporarily locked.");
    } else {
      loginAttempts.set(rateLimitKey, { attempts: currentAttempts, lockUntil: 0 });
    }
    throw new Error("Invalid operator login code");
  }

  // Clear rate-limiting on success
  loginAttempts.delete(rateLimitKey);

  // 4. Manage POS Session for this Terminal
  const existingSession = await prisma.posSession.findFirst({
    where: {
      companyId,
      terminalId,
      status: PosSessionStatus.OPEN,
    },
    include: {
      operator: true,
    },
  });

  let activeSession: any = null;

  if (existingSession) {
    if (existingSession.operatorId === user.id) {
      activeSession = existingSession;
    } else {
      // Clean handoff: close existing operator's session and open for new operator
      await prisma.posSession.update({
        where: { id: existingSession.id },
        data: {
          status: PosSessionStatus.CLOSED,
          shiftStatus: "CLOSED",
          closedAt: new Date(),
          notes: `Auto-closed due to operator handoff to ${user.name || user.email} on terminal ${terminalId}`,
        },
      });

      activeSession = await prisma.posSession.create({
        data: {
          companyId,
          operatorId: user.id,
          staffProfileId,
          terminalId,
          status: PosSessionStatus.OPEN,
          shiftStatus: "OPEN",
          openingBalance: Number(openingBalance) || 0,
          openedAt: new Date(),
        },
      });
    }
  } else {
    activeSession = await prisma.posSession.create({
      data: {
        companyId,
        operatorId: user.id,
        staffProfileId,
        terminalId,
        status: PosSessionStatus.OPEN,
        shiftStatus: "OPEN",
        openingBalance: Number(openingBalance) || 0,
        openedAt: new Date(),
      },
    });
  }

  const operatorInfo: POSOperatorInfo = {
    id: user.id,
    name: user.name || "Staff Member",
    email: user.email,
    role,
    jobTitle,
    staffProfileId,
    permissions,
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

  return {
    success: true,
    operator: operatorInfo,
    posSession: sessionInfo,
    session: activeSession,
  };
}

export async function getCurrentPOSSession(companyId: string, terminalId = "T01") {
  if (!companyId) return null;

  const session = await prisma.posSession.findFirst({
    where: {
      companyId,
      terminalId,
      status: PosSessionStatus.OPEN,
    },
    include: {
      operator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      staffProfile: {
        select: {
          id: true,
          jobTitle: true,
          department: true,
          posRole: true,
          posPermissions: true,
        },
      },
    },
    orderBy: {
      openedAt: "desc",
    },
  });

  if (!session) return null;

  // Calculate live shift cash sales
  const cashOrders = await prisma.customerOrder.aggregate({
    where: {
      posSessionId: session.id,
      paymentOption: "cash",
      status: { notIn: ["CANCELLED", "FAILED"] },
    },
    _sum: { totalFinalPrice: true },
  });

  const cashSales = cashOrders._sum.totalFinalPrice || 0;
  const expectedCash = (session.openingBalance || 0) + cashSales;

  return {
    id: session.id,
    terminalId: session.terminalId,
    status: session.status,
    shiftStatus: session.shiftStatus || "OPEN",
    openedAt: session.openedAt,
    openingBalance: session.openingBalance,
    cashSales,
    expectedCash,
    totalSales: session.totalSales,
    totalTransactions: session.totalTransactions,
    operator: {
      id: session.operator.id,
      name: session.operator.name || "Operator",
      email: session.operator.email,
      role: session.staffProfile?.posRole || session.staffProfile?.jobTitle || session.operator.role || "CASHIER",
      permissions: session.staffProfile?.posPermissions || ["POS_ACCESS", "POS_CREATE_ORDER"],
    },
  };
}

export async function endPOSSession(
  sessionId: string,
  companyId: string,
  countedCash?: number,
  closingBalance?: number,
  notes?: string
) {
  if (!sessionId || !companyId) {
    throw new Error("Session ID and Company context required to end POS session");
  }

  const session = await prisma.posSession.findFirst({
    where: {
      id: sessionId,
      companyId,
    },
  });

  if (!session) {
    throw new Error("POS Session not found or does not belong to this company");
  }

  if (session.status === PosSessionStatus.CLOSED) {
    return session;
  }

  // Aggregate orders attached to this session
  const stats = await prisma.customerOrder.aggregate({
    where: {
      posSessionId: sessionId,
      status: { notIn: ["CANCELLED", "FAILED"] },
    },
    _sum: {
      totalFinalPrice: true,
    },
    _count: {
      id: true,
    },
  });

  // Calculate totals by payment method
  const orders = await prisma.customerOrder.findMany({
    where: {
      posSessionId: sessionId,
      status: { notIn: ["CANCELLED", "FAILED"] },
    },
    select: {
      paymentOption: true,
      totalFinalPrice: true,
    },
  });

  const paymentTotals: Record<string, number> = {};
  let cashSales = 0;
  for (const ord of orders) {
    const method = (ord.paymentOption || "cash").toUpperCase();
    const amt = ord.totalFinalPrice || 0;
    paymentTotals[method] = (paymentTotals[method] || 0) + amt;
    if (method === "CASH") {
      cashSales += amt;
    }
  }

  const actualCountedCash = countedCash != null ? countedCash : (closingBalance != null ? closingBalance : null);
  const expectedCash = (session.openingBalance || 0) + cashSales;
  const cashVariance = actualCountedCash != null ? actualCountedCash - expectedCash : 0;

  const updatedSession = await prisma.posSession.update({
    where: { id: sessionId },
    data: {
      status: PosSessionStatus.CLOSED,
      shiftStatus: "CLOSED",
      closedAt: new Date(),
      closingBalance: actualCountedCash,
      countedCash: actualCountedCash,
      expectedCash,
      cashVariance,
      cashSales,
      paymentTotals,
      totalSales: stats._sum.totalFinalPrice || 0,
      totalTransactions: stats._count.id || 0,
      notes: notes ?? session.notes,
    },
  });

  return updatedSession;
}
