import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/transport/vehicles
// Fetches all transport vehicles filtered by companyId
const getVehiclesLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required to fetch vehicles.", 400);
  }

  const vehicles = await prisma.transportVehicle.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  return formatResponse(true, vehicles, "Vehicles retrieved successfully", 200);
};

export const GET = withApiHandler(getVehiclesLogic, { requireAuth: true, requireRateLimit: true });

// POST /api/admin/transport/vehicles
// Creates a new transport vehicle
const postVehicleLogic = async (request: Request) => {
  const body = await request.json();
  const { registration, make, model, type, status, capacity, companyId } = body;

  if (!registration || !make || !model || !type || !capacity || !companyId) {
    return formatResponse(
      false,
      null,
      "Registration, make, model, type, capacity, and company ID are required.",
      400
    );
  }

  // Check if registration already exists
  const existingVehicle = await prisma.transportVehicle.findUnique({
    where: { registration },
  });
  if (existingVehicle) {
    return formatResponse(false, null, "A vehicle with this registration already exists.", 409);
  }

  const newVehicle = await prisma.transportVehicle.create({
    data: {
      registration,
      make,
      model,
      type,
      status: status || "ACTIVE",
      capacity: parseInt(capacity),
      companyId,
    },
  });

  return formatResponse(true, newVehicle, "Vehicle created successfully", 201);
};

export const POST = withApiHandler(postVehicleLogic, { requireAuth: true, requireRateLimit: true });
