import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { ServiceStatus } from "@prisma/client"; // Assuming ServiceStatus is available

// Type definition for route parameters
type RouteParams = { params: {} }; // Since this is a root route, params are empty

// Helper function to format service data for the frontend
async function formatServiceData(service: any) {
  return {
    id: service.id,
    name: service.name,
    description: service.description || 'N/A',
    price: service.price,
    duration: service.duration,
    status: service.status,
    createdAt: service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A',
  };
}

async function handleGetServices(request: Request, { params }: RouteParams) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus"); // 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'All'

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  const whereClause: any = {
    companyId: companyId,
  };

  if (filterStatus && filterStatus !== 'All') {
    whereClause.status = filterStatus;
  }

  // Use Prisma's OR filter for searching across name and description
  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    whereClause.OR = [
      { name: { contains: lowerCaseSearchTerm, mode: 'insensitive' } },
      { description: { contains: lowerCaseSearchTerm, mode: 'insensitive' } },
    ];
  }

  const cacheKey = buildTenantCacheKey(companyId, "health-services", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const services = await prisma.service.findMany({
    where: whereClause,
    orderBy: { name: 'asc' }, // Order by service name
  });

  const formattedServices = await Promise.all(
    services.map(async (service) => formatServiceData(service))
  );

  try {
    if (formattedServices) {
      await cacheSet(cacheKey, formattedServices, 60);
    }
  } catch (e) {
    console.error("Error caching health services data:", e);
  }

  // Return the data; withApiHandler will wrap it in success: true and status 200
  return formatResponse(true, formattedServices, "Services fetched successfully", 200);
}


async function handleCreateService(request: Request, { params }: RouteParams) {
  const body = await request.json();
  const { name, description, price, duration, status, companyId } = body;

  if (!name || price === undefined || !duration || !companyId) {
    return formatResponse(false, null, "Missing required fields: name, price, duration, companyId", 400);
  }

  try {
    const newService = await prisma.service.create({
      data: {
        companyId: companyId,
        name: name,
        description: description,
        price: parseFloat(price),
        duration: duration,
        status: (status || 'ACTIVE') as ServiceStatus,
      },
    });

    const formattedNewService = await formatServiceData(newService);

    // Return the data; withApiHandler will use the provided status 201
    
    try {
      await cacheDel(`tenant:${companyId}:health-services:*`);
      await cacheDel(`admin:health-services:*`);
    } catch (e) {}
    return formatResponse(true, formattedNewService, "Service created successfully", 201);
  } catch (err: any) {
    // Handle unique constraint violation specifically (Prisma code P2002)
    if (err.code === 'P2002' && err.meta?.target?.includes('name')) {
      return formatResponse(false, null, "A service with this name already exists for this company.", 409);
    }
    // Re-throw generic errors to be caught by withApiHandler's centralized catch block
    throw err;
  }
}

// Wrap the core handlers with the middleware
export const GET = withApiHandler(handleGetServices);
export const POST = withApiHandler(handleCreateService);
