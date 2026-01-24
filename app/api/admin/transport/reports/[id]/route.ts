import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * PATCH: Update vehicle status or details
 */
export const PATCH = withApiHandler(async (request: Request, { params }: any) => {
  const { id } = params;
  const body = await request.json();

  const updatedVehicle = await prisma.transportVehicle.update({
    where: { id },
    data: { ...body }
  });

  return formatResponse(true, updatedVehicle, "Vehicle updated", 200);
}, { requireAuth: true });

/**
 * DELETE: Remove vehicle from system
 */
export const DELETE = withApiHandler(async (request: Request, { params }: any) => {
  const { id } = params;
  
  await prisma.transportVehicle.delete({ where: { id } });
  
  return formatResponse(true, null, "Vehicle removed from fleet", 200);
}, { requireAuth: true });