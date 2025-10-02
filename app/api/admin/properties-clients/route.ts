// app/api/clients/route.ts
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// Define the ROLE enum if not already globally available
enum ROLE {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
  // ... other roles
}

// Mock authentication/authorization for demonstration
const authorizeAdmin = async (req: Request) => {
  // TODO: Replace with real authentication/authorization
  return { authorized: true, status: 200, message: "authorized" };
};

// --- GET: Fetch all clients ---
const getClients = async (req: Request) => {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return formatResponse(false, null, authResult.message, authResult.status);
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  const clients = await prisma.client.findMany({
    where: companyId ? { companyId } : {},
    include: { user: {
      select: { name: true, email: true, phone: true }
    } },
    orderBy: { createdAt: "desc" },
  });

  const clientProfiles = clients.map((c) => ({
    id: c.id,
    name: c.user.name || "",
    email: c.user.email,
    phone: c.user.phone || "",
    inquiryCount: c.inquiryCount || 0,
    dealStatus: (c.dealStatus as "Lead" | "Active" | "Closed" | "Archived") || "Lead",
    lastActivity:
      c.lastActivity?.toISOString() ||
      c.createdAt?.toISOString() ||
      new Date().toISOString(),
    notes: c.notes || "",
    preferredPropertyTypes: c.preferredPropertyTypes || [],
    budgetRange: c.budgetRange || "",
  }));

  return formatResponse(true, clientProfiles, "Clients fetched successfully", 200);
};

// --- POST: Create a new client ---
const createClient = async (req: Request) => {
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
    companyId,
    salesAgentId,
    inquiryCount = 0,
    dealStatus = "Lead",
    lastActivity = new Date().toISOString(),
    notes = "",
    preferredPropertyTypes = [],
    budgetRange = "",
  } = await req.json();

  // 1. Validation
  if (!name || !email || !companyId) {
    return formatResponse(
      false,
      null,
      "Missing required fields: name, email, companyId",
      400
    );
  }

  // 2. Check for duplicate email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return formatResponse(false, null, "User with this email already exists.", 409);
  }

  // 3. Hash password
  let hashedPassword: string | null = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // 4. Create User
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: ROLE.CLIENT,
      phone,
      bio,
      emailVerified: false,
    },
  });

  // 5. Create Client
  const newClient = await prisma.client.create({
    data: {
      userId: newUser.id,
      companyId,
      salesAgentId: salesAgentId || undefined,
      inquiryCount,
      dealStatus,
      lastActivity: new Date(lastActivity),
      notes,
      preferredPropertyTypes,
      budgetRange,
    },
    include: { user: true },
  });

  const clientProfile = {
    id: newClient.id,
    name: newUser.name || "",
    email: newUser.email,
    phone: newUser.phone || "",
    inquiryCount: newClient.inquiryCount || 0,
    dealStatus: (newClient.dealStatus as "Lead" | "Active" | "Closed" | "Archived") || "Lead",
    lastActivity:
      newClient.lastActivity?.toISOString() ||
      newClient.createdAt?.toISOString() ||
      new Date().toISOString(),
    notes: newClient.notes || "",
    preferredPropertyTypes: newClient.preferredPropertyTypes || [],
    budgetRange: newClient.budgetRange || "",
  };

  return formatResponse(true, clientProfile, "Client created successfully", 201);
};

// Export wrapped handlers
export const GET = withApiHandler(getClients, { requireAuth: true });
export const POST = withApiHandler(createClient, { requireAuth: true });
