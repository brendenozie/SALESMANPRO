import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) return new NextResponse("Missing Company ID", { status: 400 });

    
    const cacheKey = buildTenantCacheKey(companyId, "drivers", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  
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
      loginCode: d.loginCode,
      licenseExpiry: d.licenseExpiry ? d.licenseExpiry.toISOString().split('T')[0] : null,
      experienceYears: d.experienceYears,
      status: d.status, // ACTIVE, SUSPENDED, INACTIVE
    }));

  try {
    if (drivers) {
      await cacheSet(cacheKey, formattedDrivers, 60);
    }
  } catch (e) {}

    return formatResponse(true, formattedDrivers, "Drivers retrieved", 200);
  } catch (error) {
    return formatResponse(false, null, "Internal Error", 500);
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
          email: email || `${licenseNumber.toLowerCase()}@store.com`, // Fallback email
          phone: phoneNumber,
          role: "STORE_DRIVER", // Or add DRIVER to your ROLE enum
          companyId,
          staffProfile: {
            create: {
              companyId,
              jobTitle: "Driver",
              department: "Transport",
              employmentStatus: "ACTIVE",
            },
          },
        },
      });

      //create login code for driver app (random 6 digit number as string)
      let loginCode = Math.floor(100000 + Math.random() * 900000).toString();

      //confirm uniqueness of login code (in case of collision, regenerate)
      let isUnique = false;
      while (!isUnique) {
        const existing = await tx.transportDriver.findUnique({ where: { loginCode } });
        if (!existing) {
          isUnique = true;
        } else {
          loginCode = Math.floor(100000 + Math.random() * 900000).toString();
        }
      }

      const newDriver = await tx.transportDriver.create({
        data: {
          userId: newUser.id,
          companyId,
          licenseNo: licenseNumber,
          licenseImgUrl: licenseUrl,
          loginCode,
          status: "ACTIVE",
          licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        },
        include: { user: true }
      });

      return newDriver;
    });

    try {
      await cacheDel(`tenant:${companyId}:drivers:*`);
      await cacheDel(`admin:drivers:*`);
    } catch (e) {}
    return formatResponse(true, {
      id: result.id,
      name: result.user.name,
        phoneNumber: result.user.phone,
        licenseNumber: result.licenseNo,
        loginCode: result.loginCode,
        status: result.status,
        experienceYears: result.experienceYears,
        licenseExpiry: result.licenseExpiry ? result.licenseExpiry.toISOString().split('T')[0] : null
      } , "Driver created successfully", 201);
  } catch (error: any) {
    console.error(error);
    return formatResponse(false, null, error.message || "Failed to create driver", 500);
  }
}