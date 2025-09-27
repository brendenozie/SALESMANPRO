// app/api/admin/agents/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Define the ROLE enum if not globally available
enum ROLE {
  ADMIN = "ADMIN",
  SALES_AGENT = "AGENT",
  // ... other roles
}

// --- Authorization helper ---
const authorizeAdmin = async (req: NextRequest) => {
  // Replace with real RBAC logic (decode token, check user role, etc.)
  return { authorized: true, status: 200, message: "Authorized" };
};

// --- PUT: Update an existing agent ---
async function updateAgent(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return formatResponse(false, null, authResult.message, authResult.status);
  }

  const agentId = params.id;

  try {
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
      where: { id: salesAgent.userId },
      data: {
        name: name ?? salesAgent.user.name,
        email: email ?? salesAgent.user.email,
        phone: phone ?? salesAgent.user.phone,
        bio: bio ?? salesAgent.user.bio,
        profilePicture: profileImageUrl ?? salesAgent.user.profilePicture,
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
      include: {
        user: true,
      },
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
      totalListings: 0, // Placeholder
      closedDeals: 0,   // Placeholder
      joinedAt: updatedSalesAgent.createdAt?.toISOString() || new Date().toISOString(),
    };

    return formatResponse(true, agentProfile, "Agent updated successfully", 200);
  } catch (error: any) {
    console.error("Error updating agent:", error);
    return formatResponse(false, null, "Internal server error", 500);
  }
}

// --- DELETE: Delete an agent ---
async function deleteAgent(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return formatResponse(false, null, authResult.message, authResult.status);
  }

  const agentId = params.id;

  try {
    const salesAgent = await prisma.salesAgent.findUnique({
      where: { id: agentId },
      select: { userId: true },
    });

    if (!salesAgent) {
      return formatResponse(false, null, "Agent not found", 404);
    }

    await prisma.salesAgent.delete({ where: { id: agentId } });
    await prisma.user.delete({ where: { id: salesAgent.userId } });

    return formatResponse(true, null, "Agent deleted successfully", 200);
  } catch (error) {
    console.error("Error deleting agent:", error);
    return formatResponse(false, null, "Internal server error", 500);
  }
}

// ✅ Export handlers wrapped with withApiHandler
export const PUT = withApiHandler(updateAgent);
export const DELETE = withApiHandler(deleteAgent);
