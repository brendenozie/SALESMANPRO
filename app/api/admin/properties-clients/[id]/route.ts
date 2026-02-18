import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/clients/[id]/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Mock authentication/authorization for demonstration
const authorizeAdmin = async (req: Request) => {
  // TODO: Replace with real admin check
  return { authorized: true, status: 200, message: "Approved" };
};

// --- PUT: Update an existing client ---
const updateClient = async (req: Request, { params }: { params: { id: string } }) => {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return formatResponse(false, null, authResult.message, authResult.status);
  }

  const clientId = params.id;

  const {
    name,
    email,
    phone,
    bio,
    salesAgentId,
    inquiryCount,
    dealStatus,
    lastActivity,
    notes,
    preferredPropertyTypes,
    budgetRange,
  } = await req.json();

  // 1. Find the Client and its associated User
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { user: true },
  });

  if (!client) {
    return formatResponse(false, null, "Client not found", 404);
  }

  // 2. Update User details
  const updatedUser = await prisma.user.update({
    where: { id: client.userId },
    data: {
      name: name ?? client.user.name,
      email: email ?? client.user.email,
      phone: phone ?? client.user.phone,
      bio: bio ?? client.user.bio,
    },
  });

  // 3. Update Client details
  const updatedClient = await prisma.client.update({
    where: { id: clientId },
    data: {
      salesAgentId: salesAgentId ?? client.salesAgentId,
      inquiryCount: inquiryCount ?? client.inquiryCount,
      dealStatus: dealStatus ?? client.dealStatus,
      lastActivity: lastActivity ? new Date(lastActivity) : client.lastActivity,
      notes: notes ?? client.notes,
      preferredPropertyTypes: preferredPropertyTypes ?? client.preferredPropertyTypes,
      budgetRange: budgetRange ?? client.budgetRange,
    },
    include: { user: true },
  });

  const clientProfile = {
    id: updatedClient.id,
    name: updatedUser.name || "",
    email: updatedUser.email,
    phone: updatedUser.phone || "",
    inquiryCount: updatedClient.inquiryCount || 0,
    dealStatus: (updatedClient.dealStatus as "Lead" | "Active" | "Closed" | "Archived") || "Lead",
    lastActivity:
      updatedClient.lastActivity?.toISOString() ||
      updatedClient.createdAt?.toISOString() ||
      new Date().toISOString(),
    notes: updatedClient.notes || "",
    preferredPropertyTypes: updatedClient.preferredPropertyTypes || [],
    budgetRange: updatedClient.budgetRange || "",
  };

  return formatResponse(true, clientProfile, "Client updated successfully", 200);
};

// --- DELETE: Delete a client ---
const deleteClient = async (req: Request, { params }: { params: { id: string } }) => {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return formatResponse(false, null, authResult.message, authResult.status);
  }

  const clientId = params.id;

  // 1. Find the Client to get its associated userId
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { userId: true },
  });

  if (!client) {
    return formatResponse(false, null, "Client not found", 404);
  }

  // 2. Delete the Client record
  await prisma.client.delete({ where: { id: clientId } });

  // 3. Delete the associated User record
  await prisma.user.delete({ where: { id: client.userId } });

  return formatResponse(true, null, "Client deleted successfully", 200);
};

// Export wrapped handlers with authentication required
export const PUT = withApiHandler(updateClient, { requireAuth: true });
export const DELETE = withApiHandler(deleteClient, { requireAuth: true });
