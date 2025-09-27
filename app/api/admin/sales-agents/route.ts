// app/api/admin/agents/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs";
import { AgentProfile } from "@/app/admin/[slug]/agents/AgentsClient";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Define the ROLE enum
enum ROLE {
  ADMIN = "ADMIN",
  SALES_AGENT = "AGENT",
}

// --- Authorization helper ---
const authorizeAdmin = async (req: NextRequest) => {
  // TODO: Implement real RBAC logic here
  return { authorized: true, status: 200, message: "Authorized" };
};

// --- GET: Fetch all agents ---
async function getAgents(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized)
    return formatResponse(false, null, authResult.message, authResult.status);

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const salesAgents = await prisma.salesAgent.findMany({
      where: { companyId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const agents: AgentProfile[] = salesAgents.map((sa) => ({
      id: sa.id,
      name: sa.user.name || "",
      email: sa.user.email,
      phone: sa.user.phone || "",
      bio: sa.user.bio || "",
      profileImageUrl: sa.user.profilePicture || "",
      isActive: sa.isActive,
      specialties: sa.specialties,
      regions: sa.regions,
      totalListings: 0,
      closedDeals: 0,
      joinedAt: sa.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return formatResponse(true, agents, "Agents fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return formatResponse(false, null, "Internal server error", 500);
  }
}

// --- POST: Create a new agent ---
async function createAgent(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized)
    return formatResponse(false, null, authResult.message, authResult.status);

  try {
    const {
      name,
      email,
      password,
      phone,
      bio,
      profileImageUrl,
      isActive = true,
      specialties = [],
      regions = [],
      companyId,
    } = await req.json();

    if (!name || !email || !phone || !bio || !companyId)
      return formatResponse(
        false,
        null,
        "Missing required fields: name, email, phone, bio, companyId",
        400
      );

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return formatResponse(false, null, "User with this email already exists.", 409);

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: ROLE.SALES_AGENT,
        phone,
        bio,
        profilePicture: profileImageUrl,
        emailVerified: new Date(),
      },
    });

    const loginCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newSalesAgent = await prisma.salesAgent.create({
      data: {
        userId: newUser.id,
        loginCode,
        phoneNumber: phone,
        companyId,
        isActive,
        specialties,
        regions,
      },
      include: { user: true },
    });

    const agentProfile: AgentProfile = {
      id: newSalesAgent.id,
      name: newUser.name || "",
      email: newUser.email,
      phone: newUser.phone || "",
      bio: newUser.bio || "",
      profileImageUrl: newUser.profilePicture || "",
      isActive: newSalesAgent.isActive,
      specialties: newSalesAgent.specialties,
      regions: newSalesAgent.regions,
      totalListings: 0,
      closedDeals: 0,
      joinedAt: newSalesAgent.createdAt?.toISOString() || new Date().toISOString(),
    };

    return formatResponse(true, agentProfile, "Agent created successfully", 201);
  } catch (error) {
    console.error("Error creating agent:", error);
    return formatResponse(false, null, "Internal server error", 500);
  }
}

// ✅ Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getAgents);
export const POST = withApiHandler(createAgent);
