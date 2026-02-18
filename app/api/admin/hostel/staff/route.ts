import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs"; // Recommended for passwords

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

    return NextResponse.json({ data: staff });
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("STAFF_POST_ERROR", error);

    // Handle specific errors
    if (error.message === "EMAIL_REQUIRED") {
      return NextResponse.json({ error: "Email is required to create a new user account" }, { status: 400 });
    }

    if (error.code === 'P2002') {
      const target = error.meta?.target || "";
      if (target.includes('email')) return NextResponse.json({ error: "This email is already registered to another user" }, { status: 400 });
      if (target.includes('staffId')) return NextResponse.json({ error: "This Staff ID (Badge Number) is already assigned" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to set up staff profile" }, { status: 500 });
  }
}