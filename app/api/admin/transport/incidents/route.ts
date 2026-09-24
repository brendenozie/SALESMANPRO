import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return formatResponse(false, null, "Company ID is required.", 400);
    }

    const records = await prisma.transportMaintenance.findMany({
      where: {
        vehicle: { companyId },
        description: { startsWith: "Incident:" },
      },
      include: {
        vehicle: { select: { id: true, registration: true, make: true, model: true } },
      },
      orderBy: { scheduledDate: "desc" },
    });

    const incidents = records.map((r) => {
      // Parse "Incident: [type] - [notes] | Driver: [driver] | Severity: [sev]"
      let type = "General Incident";
      let driver = "Assigned Driver";
      let severity = "Medium";
      let cleanNotes = r.notes || "";

      const desc = r.description.replace(/^Incident:\s*/, "");
      const parts = desc.split("|").map((p) => p.trim());
      if (parts[0]) type = parts[0];
      for (const p of parts) {
        if (p.startsWith("Driver:")) driver = p.replace("Driver:", "").trim();
        if (p.startsWith("Severity:")) severity = p.replace("Severity:", "").trim();
      }

      const statusMap: Record<string, string> = {
        SCHEDULED: "Under Investigation",
        IN_PROGRESS: "Under Investigation",
        COMPLETED: "Resolved",
        CANCELLED: "Logged",
      };

      return {
        id: r.id,
        date: r.scheduledDate.toISOString().split("T")[0],
        bus: r.vehicle?.registration || "Fleet Vehicle",
        type,
        severity: (severity as "High" | "Medium" | "Low") || "Medium",
        status: (statusMap[r.status] as any) || "Logged",
        driver,
        notes: cleanNotes || r.description,
        hasVideo: false,
        hasPhotos: false,
      };
    });

    return formatResponse(true, incidents, "Incidents retrieved successfully", 200);
  } catch (error: any) {
    console.error("[TRANSPORT_INCIDENTS_GET]", error);
    return formatResponse(false, null, error.message || "Failed to load incidents", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, bus, type, severity, status, driver, notes } = body;

    if (!companyId) {
      return formatResponse(false, null, "Company ID is required.", 400);
    }

    // Resolve or find vehicle for this company
    let vehicle = await prisma.transportVehicle.findFirst({
      where: {
        companyId,
        ...(bus ? { OR: [{ registration: bus }, { id: bus }] } : {}),
      },
    });

    if (!vehicle) {
      vehicle = await prisma.transportVehicle.findFirst({
        where: { companyId },
      });
    }

    if (!vehicle) {
      return formatResponse(false, null, "No transport vehicle found for company to attach incident report.", 404);
    }

    const maintenanceStatus = status === "Resolved" ? "COMPLETED" : "SCHEDULED";
    const formattedDesc = `Incident: ${type || "Issue"} | Driver: ${driver || "Staff"} | Severity: ${severity || "Medium"}`;

    const record = await prisma.transportMaintenance.create({
      data: {
        vehicleId: vehicle.id,
        description: formattedDesc,
        scheduledDate: new Date(),
        completedDate: status === "Resolved" ? new Date() : null,
        cost: 0,
        status: maintenanceStatus,
        notes: notes || `Reported by dispatch. Severity: ${severity}`,
      },
      include: { vehicle: true },
    });

    return formatResponse(
      true,
      {
        id: record.id,
        date: record.scheduledDate.toISOString().split("T")[0],
        bus: record.vehicle.registration,
        type: type || "General Incident",
        severity: severity || "Medium",
        status: status || "Under Investigation",
        driver: driver || "Staff",
        notes: record.notes,
      },
      "Incident recorded successfully",
      201
    );
  } catch (error: any) {
    console.error("[TRANSPORT_INCIDENTS_POST]", error);
    return formatResponse(false, null, error.message || "Failed to log incident", 500);
  }
}
