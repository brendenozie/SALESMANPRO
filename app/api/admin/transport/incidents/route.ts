import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return json({ success: false, message: "Company ID is required." }, 400);
    }

    const records = await prisma.transportIncident.findMany({
      where: { companyId },
      include: {
        vehicle: { select: { id: true, registration: true, make: true, model: true } },
        driver: { include: { user: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
    });

    const incidents = records.map((r) => ({
      id: r.id,
      date: r.date.toISOString().split("T")[0],
      bus: r.vehicle?.registration || "Fleet Vehicle",
      type: r.type,
      severity: r.severity as "High" | "Medium" | "Low",
      status: r.status,
      driver: r.driver?.user?.name || "Assigned Driver",
      notes: r.notes || "",
      hasVideo: r.hasVideo,
      hasPhotos: r.hasPhotos,
    }));

    return json({ success: true, data: incidents });
  } catch (error: any) {
    console.error("[TRANSPORT_INCIDENTS_GET]", error);
    return json({ success: false, message: error.message || "Failed to load incidents" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, bus, vehicleId, type, severity, status, driverId, notes } = body;

    if (!companyId) {
      return json({ success: false, message: "Company ID is required." }, 400);
    }

    // Resolve vehicle
    let resolvedVehicleId = vehicleId || null;
    if (!resolvedVehicleId && bus) {
      const v = await prisma.transportVehicle.findFirst({
        where: {
          companyId,
          OR: [{ registration: bus }, { id: bus }],
        },
      });
      if (v) resolvedVehicleId = v.id;
    }

    const record = await prisma.transportIncident.create({
      data: {
        companyId,
        vehicleId: resolvedVehicleId,
        driverId: driverId || null,
        type: type || "General Incident",
        severity: severity || "Medium",
        status: status || "Under Investigation",
        date: new Date(),
        notes: notes || null,
      },
      include: {
        vehicle: true,
        driver: { include: { user: true } },
      },
    });

    return json(
      {
        success: true,
        message: "Incident logged successfully",
        data: {
          id: record.id,
          date: record.date.toISOString().split("T")[0],
          bus: record.vehicle?.registration || "Fleet Vehicle",
          type: record.type,
          severity: record.severity,
          status: record.status,
          driver: record.driver?.user?.name || "Staff",
          notes: record.notes,
        },
      },
      201
    );
  } catch (error: any) {
    console.error("[TRANSPORT_INCIDENTS_POST]", error);
    return json({ success: false, message: error.message || "Failed to log incident" }, 500);
  }
}
