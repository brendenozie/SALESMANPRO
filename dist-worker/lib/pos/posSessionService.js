"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPOSSession = exports.getCurrentPOSSession = exports.authenticatePOSOperator = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const client_1 = require("@prisma/client");
// In-memory rate limiting map for POS login code attempts: key -> { attempts: number, lockUntil: number }
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes
async function authenticatePOSOperator(input) {
    const { companyId, loginCode, terminalId = "T01" } = input;
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
    // 1. Look up StaffProfile scoped to companyId
    const staff = await prismadb_1.default.staffProfile.findFirst({
        where: {
            loginCode: cleanCode,
            companyId,
        },
        include: {
            user: true,
        },
    });
    let user = null;
    let jobTitle = "Staff Member";
    let staffProfileId = undefined;
    if (staff) {
        // Check employment status
        if (staff.employmentStatus !== "ACTIVE") {
            throw new Error("Access denied: Staff profile is inactive or disabled");
        }
        if (!staff.user) {
            throw new Error("Access denied: No active user associated with this staff profile");
        }
        if (staff.user.isActive === false || staff.user.deletedAt !== null) {
            throw new Error("Access denied: User account is deactivated");
        }
        user = staff.user;
        jobTitle = staff.jobTitle || "Staff Member";
        staffProfileId = staff.id;
    }
    else {
        // 2. Check if a StaffProfile with this loginCode belongs to ANOTHER company (cross-tenant check)
        const otherStoreStaff = await prismadb_1.default.staffProfile.findFirst({
            where: {
                loginCode: cleanCode,
                companyId: { not: companyId },
            },
        });
        if (otherStoreStaff) {
            throw new Error("Access denied: This login code is not authorized for this store/company");
        }
        // 3. Fallback: check SalesAgent or User in this company
        const salesAgent = await prismadb_1.default.salesAgent.findFirst({
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
        }
    }
    if (!user) {
        // Increment failed attempt counter
        const currentAttempts = (attemptRecord?.attempts || 0) + 1;
        if (currentAttempts >= MAX_ATTEMPTS) {
            loginAttempts.set(rateLimitKey, { attempts: currentAttempts, lockUntil: now + LOCKOUT_MS });
            throw new Error("Too many failed attempts. Terminal temporarily locked.");
        }
        else {
            loginAttempts.set(rateLimitKey, { attempts: currentAttempts, lockUntil: 0 });
        }
        throw new Error("Invalid operator login code");
    }
    // Clear rate-limiting on success
    loginAttempts.delete(rateLimitKey);
    // 4. Manage POS Session for this Terminal
    // Find if there is an existing open session for this terminal
    const existingSession = await prismadb_1.default.posSession.findFirst({
        where: {
            companyId,
            terminalId,
            status: client_1.PosSessionStatus.OPEN,
        },
        include: {
            operator: true,
        },
    });
    let activeSession = null;
    if (existingSession) {
        if (existingSession.operatorId === user.id) {
            // Same operator resuming on this terminal
            activeSession = existingSession;
        }
        else {
            // Different operator logging in -> close the previous operator's session cleanly
            await prismadb_1.default.posSession.update({
                where: { id: existingSession.id },
                data: {
                    status: client_1.PosSessionStatus.CLOSED,
                    closedAt: new Date(),
                    notes: `Auto-closed due to operator handoff on terminal ${terminalId}`,
                },
            });
            // Create new session for the new operator
            activeSession = await prismadb_1.default.posSession.create({
                data: {
                    companyId,
                    operatorId: user.id,
                    staffProfileId,
                    terminalId,
                    status: client_1.PosSessionStatus.OPEN,
                    openedAt: new Date(),
                },
            });
        }
    }
    else {
        // No open session exists -> create new session
        activeSession = await prismadb_1.default.posSession.create({
            data: {
                companyId,
                operatorId: user.id,
                staffProfileId,
                terminalId,
                status: client_1.PosSessionStatus.OPEN,
                openedAt: new Date(),
            },
        });
    }
    return {
        success: true,
        operator: {
            id: user.id,
            name: user.name || "Staff Member",
            email: user.email,
            role: (jobTitle || user.role || "CASHIER").toString(),
            jobTitle,
            staffProfileId,
        },
        posSession: {
            id: activeSession.id,
            terminalId: activeSession.terminalId,
            status: activeSession.status,
            openedAt: activeSession.openedAt,
        },
        session: activeSession,
    };
}
exports.authenticatePOSOperator = authenticatePOSOperator;
async function getCurrentPOSSession(companyId, terminalId = "T01") {
    if (!companyId)
        return null;
    const session = await prismadb_1.default.posSession.findFirst({
        where: {
            companyId,
            terminalId,
            status: client_1.PosSessionStatus.OPEN,
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
                },
            },
        },
        orderBy: {
            openedAt: "desc",
        },
    });
    if (!session)
        return null;
    return {
        id: session.id,
        terminalId: session.terminalId,
        status: session.status,
        openedAt: session.openedAt,
        totalSales: session.totalSales,
        totalTransactions: session.totalTransactions,
        operator: {
            id: session.operator.id,
            name: session.operator.name || "Operator",
            email: session.operator.email,
            role: session.staffProfile?.jobTitle || session.operator.role || "CASHIER",
        },
    };
}
exports.getCurrentPOSSession = getCurrentPOSSession;
async function endPOSSession(sessionId, companyId, closingBalance, notes) {
    if (!sessionId || !companyId) {
        throw new Error("Session ID and Company context required to end POS session");
    }
    const session = await prismadb_1.default.posSession.findFirst({
        where: {
            id: sessionId,
            companyId,
        },
    });
    if (!session) {
        throw new Error("POS Session not found or does not belong to this company");
    }
    if (session.status === client_1.PosSessionStatus.CLOSED) {
        return session;
    }
    // Aggregate orders attached to this session
    const stats = await prismadb_1.default.customerOrder.aggregate({
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
    const updatedSession = await prismadb_1.default.posSession.update({
        where: { id: sessionId },
        data: {
            status: client_1.PosSessionStatus.CLOSED,
            closedAt: new Date(),
            closingBalance: closingBalance ?? null,
            totalSales: stats._sum.totalFinalPrice || 0,
            totalTransactions: stats._count.id || 0,
            notes: notes ?? session.notes,
        },
    });
    return updatedSession;
}
exports.endPOSSession = endPOSSession;
