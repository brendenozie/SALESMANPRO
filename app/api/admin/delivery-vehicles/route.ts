import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/vehicles/route.ts

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { ListingStatus, Product } from "@prisma/client";

// A helper type to match the frontend's expected vehicle structure
type VehicleData = {
  id: string;
  plateNumber: string;
  companyId: string;
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


// --- Data Mapping Helpers ---


const mapStatusToPrisma = (status: VehicleData['status']): ListingStatus => {
  switch (status) {
    case 'Active':
      return ListingStatus.ACTIVE;
    case 'Maintenance':
      // Using 'PENDING' as a proxy for 'Maintenance'
      return ListingStatus.PENDING;
    case 'Retired':
      // Using 'INACTIVE' as a proxy for 'Retired'
      return ListingStatus.INACTIVE;
    default:
      return ListingStatus.DRAFT;
  }
};


const mapPrismaToStatus = (status: ListingStatus): VehicleData['status'] => {
    switch (status) {
      case ListingStatus.ACTIVE:
        return 'Active';
      case ListingStatus.PENDING:
        return 'Maintenance';
      case ListingStatus.INACTIVE:
      case ListingStatus.SOLD: // Also consider 'SOLD' as 'Retired'
        return 'Retired';
      default:
        return 'Active';
    }
}


const formatProductAsVehicle = (product: Product): VehicleData => {
  return {
    id: product.id,
    plateNumber: product.vin || 'N/A', // Using `vin` field for plate number
    make: product.make || '',
    companyId: product.companyId || '',
    model: product.model || '',
    type: (product.type as VehicleData['type']) || 'Car',
    year: product.year || new Date().getFullYear(),
    assignedRiderId: product.contact, // Using `contact` field for rider ID
    assignedRiderName: product.contactName || 'Unassigned', // Using `contactName` for rider name
    status: mapPrismaToStatus(product.status),
    // Parsing mileage string (e.g., "87900 km") to a number
    mileageKm: parseInt(product.mileage?.replace(/,/g, '').split(' ')[0] || '0'),
    // Using `serviceHistory` field for the last service date
    lastServiceDate: product.serviceHistory || new Date().toISOString(),
  };
};

// --- API Handlers ---


export const GET = withApiHandler(async (request, context) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || context.user?.companyId;

  if (!companyId) {
    return formatResponse(false, null, "Company ID is required.", 400);
  }

  // Extract search and filter params from the request
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterType = searchParams.get("filterType") || "All";
  const filterStatus = searchParams.get("filterStatus") || "All";

  // Build the Prisma query's `where` clause
  const where: any = {
    companyId,
    // Add a condition to only fetch products that are vehicles.
    // We assume a vehicle must have a `make` and `model`.
    make: { not: null },
    model: { not: null },
  };

  if (searchTerm) {
    where.OR = [
      { vin: { contains: searchTerm, mode: 'insensitive' } }, // plateNumber
      { make: { contains: searchTerm, mode: 'insensitive' } },
      { model: { contains: searchTerm, mode: 'insensitive' } },
      { contactName: { contains: searchTerm, mode: 'insensitive' } }, // rider name
    ];
  }

  if (filterType !== "All") {
    where.type = filterType;
  }

  if (filterStatus !== "All") {
    where.status = mapStatusToPrisma(filterStatus as VehicleData['status']);
  }

  
    const cacheKey = `admin:delivery-vehicles:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  try {
    if (products) {
      await cacheSet(cacheKey, products, 60);
    }
  } catch (e) {}

  const vehicles = products.map(formatProductAsVehicle);

  return formatResponse(true, vehicles, "Vehicles fetched successfully.", 200);
});



export const POST = withApiHandler(async (request, context) => {
  
  const body: Omit<VehicleData, 'id'> = await request.json();
  const { 
    plateNumber, make, model, type, year, 
    assignedRiderId, assignedRiderName, status, 
    mileageKm, lastServiceDate ,
    companyId
  } = body;
  
  if (!companyId) {
    return formatResponse(false, null, "Authentication error: Company ID not found.", 401);
  }

  if (!plateNumber || !make || !model) {
    return formatResponse(false, null, "Plate Number, Make, and Model are required.", 400);
  }

  // Create the new vehicle using the Product model
  const newProduct = await prisma.product.create({
    data: {
      companyId,
      name: `${year} ${make} ${model}`, // Construct a product name
      vin: plateNumber,
      make,
      model,
      type,
      year,
      status: mapStatusToPrisma(status),
      // Map vehicle-specific data to generic product fields
      mileage: `${mileageKm} km`,
      serviceHistory: new Date(lastServiceDate).toISOString(),
      contact: assignedRiderId,
      contactName: assignedRiderName,
      // Default values for other required/important Product fields
      sellingPrice: 0,
      quantity: 1,
    }
  });

  const newVehicle = formatProductAsVehicle(newProduct);
  
    try { await cacheDel(`admin:delivery-vehicles:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, newVehicle, "Vehicle created successfully.", 201);
});