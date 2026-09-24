import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true, role: true },
      });
      targetCompanyId = user?.companyId || null;
    }

    if (!targetCompanyId) {
      return NextResponse.json({ error: "Company context required" }, { status: 400 });
    }

    // Fetch both TransportDriver profiles and Rider/Driver users
    const [transportDrivers, riderUsers] = await Promise.all([
      prisma.transportDriver.findMany({
        where: { companyId: targetCompanyId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: {
          companyId: targetCompanyId,
          role: { in: ["RIDER", "DRIVER", "STAFF"] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
        },
      }),
    ]);

    // Format consolidated driver list
    const drivers = transportDrivers.map((td) => ({
      id: td.id,
      userId: td.userId,
      name: td.user?.name || td.licenseNumber || "Unnamed Driver",
      email: td.user?.email || null,
      phone: td.user?.phone || td.contactNumber || null,
      licenseNumber: td.licenseNumber,
      status: td.status,
      vehicleId: td.vehicleId,
      vehicle: null,
      rating: td.rating || 5.0,
      totalTrips: td.totalTrips || 0,
      source: "transportDriver",
    }));

    // Add any riders who don't have a TransportDriver profile yet
    const existingUserIds = new Set(transportDrivers.map((td) => td.userId).filter(Boolean));
    for (const rider of riderUsers) {
      if (!existingUserIds.has(rider.id)) {
        drivers.push({
          id: rider.id,
          userId: rider.id,
          name: rider.name || "Driver",
          email: rider.email,
          phone: rider.phone,
          licenseNumber: "N/A",
          status: "AVAILABLE",
          vehicleId: null,
          vehicle: null,
          rating: 5.0,
          totalTrips: 0,
          source: "userRider",
        });
      }
    }

    return NextResponse.json({ drivers });
  } catch (error: any) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch drivers" }, { status: 500 });
  }
}
