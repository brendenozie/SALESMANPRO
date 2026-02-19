import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs"; // Recommended for passwords
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return NextResponse.json({ error: "Company ID required" }, { status: 400 });

  try {
    
    const cacheKey = `admin:staff:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const staff = await prisma.hostelStaff.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            image: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

  try {
    if (staff) {
      await cacheSet(cacheKey, staff, 60);
    }
  } catch (e) {}

    return formatResponse(true, staff, "Staff retrieved successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to fetch staff", 500);
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      staffId, 
      name, 
      email, 
      password, 
      phoneNumber, 
      role, 
      shiftLabel, 
      isOnDuty, 
      companyId,
      userId // If provided, we link to existing; if not, we create new
    } = body;

    // Basic Validation
    if (!companyId || !staffId || !name) {
      return formatResponse(false, null, "Missing required fields", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalUserId = userId;

      // Scenario A: Create a new User if no userId is provided
      if (!finalUserId) {
        if (!email) throw new Error("EMAIL_REQUIRED");
        
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            password: password ? await bcrypt.hash(password, 10) : null,
            role: "STAFF", 
            companyId,
            phone: phoneNumber,
            staffProfile: {
              create: {
                companyId, jobTitle: role || "Hostel Staff", department: "Hostel",
              },
            },
          }
        });
        finalUserId = newUser.id;
      }

      // Scenario B: Link the (new or existing) User to the Staff Profile
      const staff = await tx.hostelStaff.create({
        data: {
          staffId,
          name,
          phoneNumber,
          role,
          shiftLabel,
          isOnDuty: isOnDuty ?? false,
          companyId,
          userId: finalUserId 
        },
        include: {
          user: {
            select: {
              email: true,
              image: true
            }
          }
        }
      });

      return staff;
    });

    
    try { await cacheDel(`admin:staff:${companyId || 'global'}:*`); } catch (e) {}
    
    return formatResponse(true, result, "Staff created successfully", 201);
  } catch (error: any) {
    console.error("STAFF_POST_ERROR", error);

    // Handle specific errors
    if (error.message === "EMAIL_REQUIRED") {
      return formatResponse(false, null, "Email is required to create a new user account", 400);
    }

    if (error.code === 'P2002') {
      const target = error.meta?.target || "";
      if (target.includes('email')) return formatResponse(false, null, "This email is already registered to another user", 400);
      if (target.includes('staffId')) return formatResponse(false, null, "This Staff ID (Badge Number) is already assigned", 400);
    }

    return formatResponse(false, null, "Failed to set up staff profile", 500);
  }
}