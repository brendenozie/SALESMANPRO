import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/rider/profile: Fetch full authenticated rider profile
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const profile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        vehicles: true,
      },
    });

    if (!profile) {
      return json({ success: false, message: "Rider profile not found." }, 404);
    }

    return json({ success: true, profile });
  } catch (error: any) {
    console.error("[RIDER_PROFILE_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load profile" }, 500);
  }
}

// PATCH /api/rider/profile: Update operational preferences (max distance, service areas, phone)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const { maxDistanceKm, serviceAreas, operatingCounty, operatingCity, phone, mpesaPhone, profilePhoto } = body;

    const updated = await prisma.riderProfile.update({
      where: { userId: session.user.id },
      data: {
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : undefined,
        operatingCounty: operatingCounty || undefined,
        operatingCity: operatingCity || undefined,
        phone: phone || undefined,
        mpesaPhone: mpesaPhone || undefined,
        profilePhoto: profilePhoto || undefined,
      },
      include: { vehicles: true },
    });

    return json({ success: true, message: "Preferences updated.", profile: updated });
  } catch (error: any) {
    console.error("[RIDER_PROFILE_PATCH_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to update profile" }, 500);
  }
}
