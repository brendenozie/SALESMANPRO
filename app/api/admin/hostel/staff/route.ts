import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const staff = await prisma.hostelStaff.findMany({
      where: { companyId },
      include: {
        shifts: {
          where: { isActive: true },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });

    // Formatting for the UI
    const data = staff.map(s => ({
      id: s.staffId || `STF-${s.id.slice(-2)}`,
      dbId: s.id,
      name: s.name,
      role: s.role, // e.g., 'WARDEN', 'SECURITY', 'CLEANER'
      shift: s.shifts[0]?.label || "No Shift Assigned",
      status: s.isOnDuty ? 'On-Duty' : 'Resting',
      contact: s.phoneNumber,
      avatar: s.name.split(' ').map(n => n[0]).join('').toUpperCase()
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch roster" }, { status: 500 });
  }
}