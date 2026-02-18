import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, phoneNumber, staffId, shiftLabel, companyId, userId } = body;

    // 1. Validation
    if (!name || !staffId || !companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Check for duplicate Staff ID
    const existing = await prisma.hostelStaff.findUnique({
      where: { staffId }
    });
    if (existing) {
      return NextResponse.json({ error: "Staff ID already exists" }, { status: 400 });
    }

    // 3. Create Record
    const newStaff = await prisma.hostelStaff.create({
      data: {
        name,
        role,
        phoneNumber,
        staffId,
        shiftLabel,
        companyId,
        isOnDuty: false,
        // Link to User if provided
        ...(userId && { userId }) 
      },
      include: {
        user: true // Include user details in response
      }
    });

    
    try { await cacheDel(`admin:onboard:${companyId || 'global'}:*`); } catch (e) {}
    return NextResponse.json({ data: newStaff }, { status: 201 });
  } catch (error: any) {
    console.error("ONBOARD_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}