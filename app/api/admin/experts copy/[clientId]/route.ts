

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler"; // New import
import { formatResponse } from "@/lib/formatResponse"; // New import
import { verifyAuth } from "@/lib/verifyAuth";

// Define the interface for the parameters object passed to the handler
interface Params {
  params: { id: string };
}

// Helper function to format the client data
const formatClientData = (client: any) => ({
  id: client.id,
  name: client.user.name,
  email: client.user.email,
  phoneNumber: client.user.phone,
  // These would normally be aggregated from orders:
  totalPurchases: 0,
  lastPurchaseDate: null,
  averageOrderValue: 0,
});

// =======================================================================
// GET /api/admin/clients/[id]
// Fetches a specific client by ID.
// =======================================================================
async function getClient(req: Request, { params }: Params) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const clientId = params.id;
  if (!clientId) {
    return formatResponse(false, null, "Missing client ID.", 400);
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!client) {
    return formatResponse(false, null, "Client not found.", 404);
  }

  return formatResponse(true, { data: formatClientData(client) }, null, 200);
}


// =======================================================================
// PATCH /api/admin/clients/[id]
// Updates an existing client's details (linked User record).
// =======================================================================
async function patchClient(req: Request, { params }: Params) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const clientId = params.id;
  if (!clientId) {
    return formatResponse(false, null, "Missing client ID.", 400);
  }

  const body = await req.json();
  const { name, email, phoneNumber } = body;

  // First, look up the client to get their userId
  const existing = await prisma.client.findUnique({
    where: { id: clientId },
    select: { userId: true },
  });
  if (!existing) {
    return formatResponse(false, null, "Client not found.", 404);
  }

  // Update the linked User record
  const updatedUser = await prisma.user.update({
    where: { id: existing.userId },
    data: {
      name,
      email,
      phone: phoneNumber,
    },
  });

  // Reconstruct the client object for the response
  const updatedClientResponse = {
    ...formatClientData({ id: clientId, user: updatedUser }),
  };

  return formatResponse(true, { data: updatedClientResponse }, null, 200);
}


// =======================================================================
// DELETE /api/admin/clients/[id]
// Deletes a specific client profile.
// =======================================================================
async function deleteClient(req: Request, { params }: Params) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const clientId = params.id;
  if (!clientId) {
    return formatResponse(false, null, "Missing client ID.", 400);
  }

  // Delete the client profile
  await prisma.client.delete({ where: { id: clientId } });

  // Use 200 with a success message or 204 (No Content)
  return formatResponse(true, { message: "Client successfully deleted." }, null, 200);
}

// Export the wrapped handlers
export const GET = withApiHandler(getClient);
export const PATCH = withApiHandler(patchClient);
export const DELETE = withApiHandler(deleteClient);
