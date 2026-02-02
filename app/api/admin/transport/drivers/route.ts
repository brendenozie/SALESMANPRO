import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) return new NextResponse("Missing Company ID", { status: 400 });

    const drivers = await prisma.transportDriver.findMany({
      where: { companyId },
      include: {
        user: true, // Join with User table to get name, phone, etc.
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to match your Frontend Interface
    const formattedDrivers = drivers.map(d => ({
      id: d.id,
      name: d.user.name,
      phoneNumber: d.user.phone,
      licenseNumber: d.licenseNo,
      licenseExpiry: d.licenseExpiry ? d.licenseExpiry.toISOString().split('T')[0] : null,
      experienceYears: d.experienceYears,
      status: d.status, // ACTIVE, SUSPENDED, INACTIVE
    }));

    return NextResponse.json({ success: true, data: formattedDrivers });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phoneNumber, licenseNumber, companyId, licenseUrl, email, licenseExpiry, experienceYears } = body;

    // 1. Create the User first (Prisma Transaction)
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email || `${licenseNumber.toLowerCase()}@school.com`, // Fallback email
          phone: phoneNumber,
          role: "ADMIN", // Or add DRIVER to your ROLE enum
          companyId,
          staffProfile: { create: { 
            companyId,
            jobTitle: 'Driver',
            department: 'Transport',
            employmentStatus: 'ACTIVE',
           } }
        }
      });

      const newDriver = await tx.transportDriver.create({
        data: {
          userId: newUser.id,
          companyId,
          licenseNo: licenseNumber,
          licenseImgUrl: licenseUrl,
          status: "ACTIVE",
          licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        },
        include: { user: true }
      });

      return newDriver;
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        id: result.id,
        name: result.user.name,
        phoneNumber: result.user.phone,
        licenseNumber: result.licenseNo,
        status: result.status,
        experienceYears: result.experienceYears,
        licenseExpiry: result.licenseExpiry ? result.licenseExpiry.toISOString().split('T')[0] : null
      } 
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}