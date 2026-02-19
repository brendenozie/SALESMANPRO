import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, phoneNumber, staffId, shiftLabel, companyId, userId } = body;

    // 1. Validation
    if (!name || !staffId || !companyId) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    // 2. Check for duplicate Staff ID
    const existing = await prisma.hostelStaff.findUnique({
      where: { staffId }
    });
    if (existing) {
      return formatResponse(false, null, "Staff ID already exists", 400);
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
    return formatResponse(true, newStaff, "Staff onboarded successfully", 201);
  } catch (error: any) {
    console.error("ONBOARD_ERROR", error);
    return formatResponse(false, null, error.message, 500);
  }
}