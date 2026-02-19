import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/agents/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

enum ROLE {
  ADMIN = "ADMIN",
  SALES_AGENT = "AGENT",
}

// Mock admin authorization
const authorizeAdmin = async (req: Request) => {
  // Replace with actual JWT/session/role check
  return { authorized: true, status: 200, message: "Authorized" };
};


async function putHandler(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return formatResponse(false, null, authResult.message, authResult.status);
  }

  const agentId = params.id;

  const {
    name,
    email,
    phone,
    bio,
    profileImageUrl,
    isActive,
    specialties,
    regions,
  } = await req.json();

  const salesAgent = await prisma.salesAgent.findUnique({
    where: { id: agentId },
    include: { user: true },
  });

  if (!salesAgent) {
    return formatResponse(false, null, "Agent not found", 404);
  }



  const updatedUser = await prisma.user.update({
    where: { id: salesAgent.userId || "" },
    data: {
      name: name ?? salesAgent.user?.name,
      email: email ?? salesAgent.user?.email,
      phone: phone ?? salesAgent.user?.phone,
      bio: bio ?? salesAgent.user?.bio,
      profilePicture: profileImageUrl ?? salesAgent.user?.profilePicture,
    },
  });

  const updatedSalesAgent = await prisma.salesAgent.update({
    where: { id: agentId },
    data: {
      isActive: isActive ?? salesAgent.isActive,
      specialties: specialties ?? salesAgent.specialties,
      regions: regions ?? salesAgent.regions,
      phoneNumber: phone ?? salesAgent.phoneNumber,
    },
    include: { user: true },
  });

  const agentProfile = {
    id: updatedSalesAgent.id,
    name: updatedUser.name || "",
    email: updatedUser.email,
    phone: updatedUser.phone || "",
    bio: updatedUser.bio || "",
    profileImageUrl: updatedUser.profilePicture || "",
    isActive: updatedSalesAgent.isActive,
    specialties: updatedSalesAgent.specialties,
    regions: updatedSalesAgent.regions,
    totalListings: 0,
    closedDeals: 0,
    joinedAt:
      updatedSalesAgent.createdAt?.toISOString() || new Date().toISOString(),
  };

  
    try { await cacheDel(`admin:properties-agents:${updatedSalesAgent.companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, agentProfile, "Agent updated successfully", 200);
}


async function deleteHandler(req: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return formatResponse(false, null, authResult.message, authResult.status);
  }

  const agentId = params.id;

  const salesAgent = await prisma.salesAgent.findUnique({
    where: { id: agentId },
    select: { userId: true, companyId: true },
  });

  if (!salesAgent) {
    return formatResponse(false, null, "Agent not found", 404);
  }

  await prisma.salesAgent.delete({ where: { id: agentId } });
  await prisma.user.delete({ where: { id: salesAgent.userId || "" } });

  
    try { await cacheDel(`admin:properties-agents:${salesAgent.companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Agent deleted successfully", 200);
}

// Export handlers wrapped with withApiHandler
export const PUT = withApiHandler(putHandler);
export const DELETE = withApiHandler(deleteHandler);
