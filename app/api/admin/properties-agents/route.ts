// app/api/admin/agents/route.ts
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs";
import { AgentProfile } from "@/app/admin/[slug]/agents/AgentsClient";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

enum ROLE {
  ADMIN = "ADMIN",
  SALES_AGENT = "AGENT",
}

// Mock admin authorization
const authorizeAdmin = async (req: Request) => {
  // Replace with real session/JWT role-based auth
  return { authorized: true, status: 200, message: "Authorized" };
};

/**
 * GET /api/admin/agents
 * Fetch all sales agents (optionally filtered by companyId)
 */
async function getHandler(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return formatResponse(false, null, authResult.message, authResult.status);
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || undefined;

  const salesAgents = await prisma.salesAgent.findMany({
    where: companyId ? { companyId } : {},
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const agents: AgentProfile[] = salesAgents.map((sa) => ({
    id: sa.id,
    name: sa.user?.name || "",
    email: sa.user?.email || "",
    phone: sa.user?.phone || "",
    bio: sa.user?.bio || "",
    profileImageUrl: sa.user?.profilePicture || "",
    isActive: sa.isActive,
    specialties: sa.specialties,
    regions: sa.regions,
    totalListings: 0,
    closedDeals: 0,
    joinedAt: sa.createdAt?.toISOString() || new Date().toISOString(),
  }));

  return formatResponse(true, agents, "Agents fetched successfully", 200);
}

/**
 * POST /api/admin/agents
 * Create a new sales agent
 */
async function postHandler(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return formatResponse(false, null, authResult.message, authResult.status);
  }

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

  if (!name || !email || !phone || !bio || !companyId) {
    return formatResponse(
      false,
      null,
      "Missing required fields: name, email, phone, bio, companyId",
      400
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return formatResponse(false, null, "User with this email already exists", 409);
  }

  let hashedPassword: string | null = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: ROLE.SALES_AGENT,
      phone,
      bio,
      profilePicture: profileImageUrl,
      emailVerified: false,
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
    joinedAt:
      newSalesAgent.createdAt?.toISOString() || new Date().toISOString(),
  };

  return formatResponse(true, agentProfile, "Agent created successfully", 201);
}

// Wrap handlers with API handler utility
export const GET = withApiHandler(getHandler);
export const POST = withApiHandler(postHandler);
