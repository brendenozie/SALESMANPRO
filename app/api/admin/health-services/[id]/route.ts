import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// Type definition for route parameters
type ServiceParams = { params: { adminSlug: string; id: string } };

// Helper function to format service data for the frontend
// NOTE: Assuming the 'service' object comes from prisma.service.findUnique
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

/**
 * GET Handler: Fetches a single service by ID.
 */
async function handleGetService(request: Request, { params }: ServiceParams) {
  const { id } = params;

  // We can skip the try/catch and 401 check, as withApiHandler handles it.

  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    // Explicitly return an error response for known business logic failures
    return formatResponse(false, null, "Service not found", 404);
  }

  const formattedService = await formatServiceData(service);
  
  // Return the data; withApiHandler will wrap it in success: true and status 200
  return formattedService;
}

/**
 * PUT Handler: Updates an existing service by ID.
 */
async function handleUpdateService(request: Request, { params }: ServiceParams) {
  const { id } = params;
  const body = await request.json();
  const { name, description, price, duration, status } = body;

  try {
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: name,
        description: description,
        price: price ? parseFloat(price) : undefined,
        duration: duration,
        status: status,
      },
    });

    const formattedUpdatedService = await formatServiceData(updatedService);
    return formattedUpdatedService;

  } catch (err: any) {
    // Handle unique constraint violation specifically (Prisma code P2002)
    if (err.code === 'P2002' && err.meta?.target?.includes('name')) {
      return formatResponse(false, null, "A service with this name already exists for this company.", 409);
    }
    // Re-throw generic errors to be caught by withApiHandler's centralized catch block
    throw err;
  }
}

/**
 * DELETE Handler: Deletes a service by ID.
 */
async function handleDeleteService(request: Request, { params }: ServiceParams) {
  const { id } = params;

  await prisma.service.delete({
    where: { id },
  });

  // Return a success message with 200/204 status
  return formatResponse(true, null, "Service deleted successfully", 200);
}

// Wrap the core handlers with the middleware
export const GET = withApiHandler(handleGetService);
export const PUT = withApiHandler(handleUpdateService);
export const DELETE = withApiHandler(handleDeleteService);
