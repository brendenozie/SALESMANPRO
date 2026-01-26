import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { name, role, phoneNumber, shiftLabel, staffId, companyId } = await req.json();

    const newStaff = await prisma.$transaction(async (tx) => {
      const staff = await tx.hostelStaff.create({
        data: {
          name,
          role, // e.g., 'WARDEN', 'SECURITY', 'CLEANER'
          phoneNumber,
          staffId,
          companyId,
          isOnDuty: false,
        }
      });

      await tx.hostelShift.create({
        data: {
          staffId: staff.id,
          label: shiftLabel, // e.g., 'Day (08:00 - 16:00)'
          isActive: true
        }
      });

      return staff;
    });

    return NextResponse.json({ data: newStaff }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to onboard staff" }, { status: 500 });
  }
}