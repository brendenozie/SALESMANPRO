"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceClosePOSSession = exports.listActiveCompanyPOSSessions = exports.updateStaffPOSCode = exports.listCompanyPOSStaff = exports.hashPOSCode = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const crypto_1 = __importDefault(require("crypto"));
function hashPOSCode(code) {
    return crypto_1.default.createHash("sha256").update(code.trim()).digest("hex");
}
exports.hashPOSCode = hashPOSCode;
async function listCompanyPOSStaff(companyId) {
    if (!companyId)
        return [];
    const staffList = await prismadb_1.default.staffProfile.findMany({
        where: { companyId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true,
                },
            },
            posSessions: {
                where: { status: "OPEN" },
                take: 1,
                orderBy: { openedAt: "desc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return staffList.map((s) => ({
        id: s.id,
        userId: s.user?.id,
        name: s.user?.name || "Staff Member",
        email: s.user?.email || "",
        phone: s.user?.phone || "",
        jobTitle: s.jobTitle,
        department: s.department,
        employmentStatus: s.employmentStatus,
        posRole: s.posRole || "CASHIER",
        posPermissions: s.posPermissions || [
            "POS_ACCESS",
            "POS_OPEN_SESSION",
            "POS_CLOSE_SESSION",
            "POS_CREATE_ORDER",
        ],
        loginCode: s.loginCode || null,
        hasCode: Boolean(s.loginCode || s.codeHash),
        isPosActive: s.isPosActive ?? true,
        codeLastUsedAt: s.codeLastUsedAt,
        activeSession: s.posSessions[0]
            ? {
                id: s.posSessions[0].id,
                terminalId: s.posSessions[0].terminalId,
                openedAt: s.posSessions[0].openedAt,
            }
            : null,
    }));
}
exports.listCompanyPOSStaff = listCompanyPOSStaff;
async function updateStaffPOSCode(input) {
    const { companyId, staffProfileId, code, posRole, posPermissions, isPosActive } = input;
    const staff = await prismadb_1.default.staffProfile.findFirst({
        where: { id: staffProfileId, companyId },
    });
    if (!staff) {
        throw new Error("Staff profile not found for this company");
    }
    const updateData = {};
    if (code !== undefined) {
        const cleanCode = code.trim();
        if (cleanCode.length < 3) {
            throw new Error("POS Staff Code must be at least 3 digits/characters");
        }
        updateData.codeHash = hashPOSCode(cleanCode);
        updateData.loginCode = cleanCode; // Preserved for backwards compatibility with existing UI
    }
    if (posRole !== undefined)
        updateData.posRole = posRole;
    if (posPermissions !== undefined)
        updateData.posPermissions = posPermissions;
    if (isPosActive !== undefined)
        updateData.isPosActive = isPosActive;
    const updated = await prismadb_1.default.staffProfile.update({
        where: { id: staffProfileId },
        data: updateData,
        include: { user: true },
    });
    return {
        id: updated.id,
        name: updated.user?.name,
        posRole: updated.posRole,
        posPermissions: updated.posPermissions,
        isPosActive: updated.isPosActive,
        hasCode: Boolean(updated.codeHash || updated.loginCode),
    };
}
exports.updateStaffPOSCode = updateStaffPOSCode;
async function listActiveCompanyPOSSessions(companyId) {
    if (!companyId)
        return [];
    const sessions = await prismadb_1.default.posSession.findMany({
        where: {
            companyId,
            status: "OPEN",
        },
        include: {
            operator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            staffProfile: {
                select: {
                    id: true,
                    jobTitle: true,
                    posRole: true,
                },
            },
        },
        orderBy: { openedAt: "desc" },
    });
    return sessions.map((s) => ({
        id: s.id,
        terminalId: s.terminalId,
        status: s.status,
        shiftStatus: s.shiftStatus || "OPEN",
        openedAt: s.openedAt,
        openingBalance: s.openingBalance,
        totalSales: s.totalSales,
        totalTransactions: s.totalTransactions,
        operator: {
            id: s.operator.id,
            name: s.operator.name || "Operator",
            email: s.operator.email,
            role: s.staffProfile?.posRole || s.staffProfile?.jobTitle || "CASHIER",
        },
    }));
}
exports.listActiveCompanyPOSSessions = listActiveCompanyPOSSessions;
async function forceClosePOSSession(companyId, sessionId, adminName = "Administrator") {
    const session = await prismadb_1.default.posSession.findFirst({
        where: { id: sessionId, companyId },
    });
    if (!session) {
        throw new Error("POS session not found");
    }
    return prismadb_1.default.posSession.update({
        where: { id: sessionId },
        data: {
            status: "CLOSED",
            shiftStatus: "CLOSED",
            closedAt: new Date(),
            notes: `Force closed by ${adminName} at ${new Date().toISOString()}`,
        },
    });
}
exports.forceClosePOSSession = forceClosePOSSession;
