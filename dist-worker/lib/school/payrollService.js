"use strict";
/**
 * lib/school/payrollService.ts
 *
 * School staff payroll calculation service.
 * Connects StaffProfile, StaffAttendance, and LeaveRequest to calculate
 * accurate payroll deductions for unpaid leave days and allowances.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertStaffPayrollRecord = exports.calculateStaffPayroll = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
async function calculateStaffPayroll(userId, companyId, month, year, customAllowances = 0, otherDeductions = 0) {
    // 1. Fetch user and staff profile
    const user = await prismadb_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    if (!user) {
        throw new Error(`User ${userId} not found`);
    }
    // Look for existing payroll record or default base
    const existingPayroll = await prismadb_1.default.staffPayroll.findUnique({
        where: {
            userId_month_year: {
                userId,
                month,
                year,
            },
        },
    });
    const baseSalary = existingPayroll?.basicSalary ?? 3000;
    const workingDaysInMonth = 22;
    const dailyRate = baseSalary / workingDaysInMonth;
    // 2. Fetch approved unpaid leave in this month/year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    const approvedLeaves = await prismadb_1.default.leaveRequest.findMany({
        where: {
            userId,
            companyId,
            status: "APPROVED",
            startDate: { lte: endOfMonth },
            endDate: { gte: startOfMonth },
        },
    });
    const unpaidLeaves = approvedLeaves.filter((l) => l.type.toUpperCase().includes("UNPAID"));
    const unpaidLeaveDays = unpaidLeaves.reduce((sum, l) => sum + (l.daysRequested || 0), 0);
    const leaveDeductions = Math.round(unpaidLeaveDays * dailyRate * 100) / 100;
    const totalDeductions = leaveDeductions + otherDeductions;
    const allowances = customAllowances || (existingPayroll?.allowances ?? 0);
    const netSalary = Math.max(0, Math.round((baseSalary + allowances - totalDeductions) * 100) / 100);
    return {
        userId,
        userName: user.name || "Staff Member",
        month,
        year,
        basicSalary: baseSalary,
        allowances,
        unpaidLeaveDays,
        leaveDeductions,
        otherDeductions,
        totalDeductions,
        netSalary,
    };
}
exports.calculateStaffPayroll = calculateStaffPayroll;
async function upsertStaffPayrollRecord(params) {
    const { userId, companyId, month, year, basicSalary, allowances, deductions, notes } = params;
    const netSalary = Math.max(0, basicSalary + allowances - deductions);
    return prismadb_1.default.staffPayroll.upsert({
        where: {
            userId_month_year: {
                userId,
                month,
                year,
            },
        },
        update: {
            basicSalary,
            allowances,
            deductions,
            netSalary,
            notes,
            updatedAt: new Date(),
        },
        create: {
            userId,
            companyId,
            month,
            year,
            basicSalary,
            allowances,
            deductions,
            netSalary,
            status: "DRAFT",
            notes,
        },
    });
}
exports.upsertStaffPayrollRecord = upsertStaffPayrollRecord;
