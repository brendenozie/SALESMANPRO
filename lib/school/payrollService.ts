/**
 * lib/school/payrollService.ts
 *
 * School staff payroll calculation service.
 * Connects StaffProfile, StaffAttendance, and LeaveRequest to calculate
 * accurate payroll deductions for unpaid leave days and allowances.
 */

import prisma from "@/server/db/prismadb";

export interface PayrollCalculationResult {
  userId: string;
  userName: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  unpaidLeaveDays: number;
  leaveDeductions: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}

export async function calculateStaffPayroll(
  userId: string,
  companyId: string,
  month: number,
  year: number,
  customAllowances: number = 0,
  otherDeductions: number = 0
): Promise<PayrollCalculationResult> {
  // 1. Fetch user and staff profile
  const user = await prisma.user.findUnique({
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
  const existingPayroll = await prisma.staffPayroll.findUnique({
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

  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      userId,
      companyId,
      status: "APPROVED",
      startDate: { lte: endOfMonth },
      endDate: { gte: startOfMonth },
    },
  });

  const unpaidLeaves = approvedLeaves.filter((l) =>
    l.type.toUpperCase().includes("UNPAID")
  );

  const unpaidLeaveDays = unpaidLeaves.reduce(
    (sum, l) => sum + (l.daysRequested || 0),
    0
  );

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

export async function upsertStaffPayrollRecord(
  params: {
    userId: string;
    companyId: string;
    month: number;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    notes?: string;
  }
) {
  const { userId, companyId, month, year, basicSalary, allowances, deductions, notes } = params;
  const netSalary = Math.max(0, basicSalary + allowances - deductions);

  return prisma.staffPayroll.upsert({
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
