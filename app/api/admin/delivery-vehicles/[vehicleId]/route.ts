import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/vehicles/[vehicleId]/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { ListingStatus } from "@prisma/client";

// Re-using the same helper types and functions from the main route file
type VehicleData = {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  type: 'Motorbike' | 'Car' | 'Van' | 'Bicycle' | 'Lorry';
  year: number;
  assignedRiderId: string | null;
  assignedRiderName: string | 'Unassigned';
  status: 'Active' | 'Maintenance' | 'Retired';
  mileageKm: number;
  lastServiceDate: string;
};

const mapStatusToPrisma = (status: VehicleData['status']): ListingStatus => {
  switch (status) {
    case 'Active': return ListingStatus.ACTIVE;
    case 'Maintenance': return ListingStatus.PENDING;
    case 'Retired': return ListingStatus.INACTIVE;
    default: return ListingStatus.DRAFT;
  }
};



export const PUT = withApiHandler(async (request, context) => {
  const vehicleId = context.params.vehicleId;
  const userCompanyId = context.user?.companyId;
  const body: Partial<VehicleData> = await request.json();

  const vehicleToUpdate = await prisma.product.findUnique({
    where: { id: vehicleId },
  });

  // Security check: ensure the vehicle belongs to the user's company
  if (!vehicleToUpdate || vehicleToUpdate.companyId !== userCompanyId) {
    return formatResponse(false, null, "Vehicle not found or access denied.", 404);
  }

  // Prepare data for update, only including fields that were passed
  const dataToUpdate: any = {};
  if (body.plateNumber) dataToUpdate.vin = body.plateNumber;
  if (body.make) dataToUpdate.make = body.make;
  if (body.model) dataToUpdate.model = body.model;
  if (body.type) dataToUpdate.type = body.type;
  if (body.year) dataToUpdate.year = body.year;
  if (body.status) dataToUpdate.status = mapStatusToPrisma(body.status);
  if (body.mileageKm !== undefined) dataToUpdate.mileage = `${body.mileageKm} km`;
  if (body.lastServiceDate) dataToUpdate.serviceHistory = new Date(body.lastServiceDate).toISOString();
  if (body.assignedRiderId !== undefined) dataToUpdate.contact = body.assignedRiderId;
  if (body.assignedRiderName) dataToUpdate.contactName = body.assignedRiderName;

  // Update the product name if make or model changed
  dataToUpdate.name = `${dataToUpdate.year || vehicleToUpdate.year} ${dataToUpdate.make || vehicleToUpdate.make} ${dataToUpdate.model || vehicleToUpdate.model}`;

  const updatedProduct = await prisma.product.update({
    where: { id: vehicleId },
    data: dataToUpdate,
  });

  
    try { await cacheDel(`admin:delivery-vehicles:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedProduct, "Vehicle updated successfully.", 200);
});



export const DELETE = withApiHandler(async (request, context) => {
  const vehicleId = context.params.vehicleId;
  const userCompanyId = context.user?.companyId;

  const vehicleToDelete = await prisma.product.findUnique({
    where: { id: vehicleId },
  });

  // Security check
  if (!vehicleToDelete || vehicleToDelete.companyId !== userCompanyId) {
    return formatResponse(false, null, "Vehicle not found or access denied.", 404);
  }

  await prisma.product.delete({
    where: { id: vehicleId },
  });

  
    try { await cacheDel(`admin:delivery-vehicles:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Vehicle deleted successfully.", 200);
});