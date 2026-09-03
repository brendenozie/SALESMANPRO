import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
// app/api/admin/[adminSlug]/clients/route.ts
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Helper function to format date
const formatDate = (date: Date | null) => (date ? date.toISOString().split("T")[0] : "N/A");

// GET /api/admin/[adminSlug]/clients
async function handleGET(request: Request) {
  


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) return formatResponse(false, null, "Missing companyId", 400);

  try {
    
    const cacheKey = buildTenantCacheKey(companyId, "travel-users", {});

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    const clients = await prisma.client.findMany({
      where: { companyId: company.id },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { joinDate: "desc" },
    });

    const formattedClients = clients.map((client) => ({
      id: client.id,
      userId: client.userId,
      name: client.user?.name || "N/A",
      email: client.user?.email || "N/A",
      phone: client.user?.phone || "N/A",
      membershipType: client.membershipType || "Standard",
      membershipStatus: client.membershipStatus,
      joinDate: formatDate(client.joinDate),
      lastActive: formatDate(client.lastActive),
      photoUrl: client.photoUrl || "https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo",
    }));

    try {
      await cacheSet(cacheKey, formattedClients, 60);
    } catch (e) {
      console.error("Error caching clients:", e);
    }
    return formatResponse(true, formattedClients);
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return formatResponse(false, null, error.message || "Failed to fetch clients", 500);
  }
}

// POST /api/admin/[adminSlug]/clients
async function handlePOST(request: Request) {
  


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) return formatResponse(false, null, "Missing companyId", 400);

  try {
    const body = await request.json();
    const { name, email, password, phone, membershipType, membershipStatus, photoUrl } = body;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) return formatResponse(false, null, "Company not found", 404);

    if (!name || !email || !password) {
      return formatResponse(false, null, "Name, email, and password are required", 400);
    }
    if (password.length < 8) {
      return formatResponse(false, null, "Password must be at least 8 characters", 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return formatResponse(false, null, "A user with this email already exists", 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClientData = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role: "CLIENT",
          status: "ACTIVE",
          company: { connect: { id: companyId } },
        },
      });

      const newClient = await tx.client.create({
        data: {
          userId: newUser.id,
          companyId,
          membershipType: membershipType || "STANDARD",
          membershipStatus: membershipStatus || "ACTIVE",
          photoUrl: photoUrl || null,
          joinDate: new Date(),
          lastActive: new Date(),
        },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      });

      return newClient;
    });

    const formattedNewClient = {
      id: newClientData.id,
      userId: newClientData.userId,
      name: newClientData.user?.name || "N/A",
      email: newClientData.user?.email || "N/A",
      phone: newClientData.user?.phone || "N/A",
      membershipType: newClientData.membershipType || "Standard",
      membershipStatus: newClientData.membershipStatus,
      joinDate: formatDate(newClientData.joinDate),
      lastActive: formatDate(newClientData.lastActive),
      photoUrl: newClientData.photoUrl || "https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo",
    };

    try {
      await cacheDel(`tenant:${companyId}:travel-users:*`);
      await cacheDel(`admin:travel-users:*`);
    } catch (e) {
      console.error("Error deleting cached clients:", e);
    }
    return formatResponse(true, formattedNewClient, undefined, 201);
  } catch (error: any) {
    console.error("Error creating client:", error);
    return formatResponse(false, null, error.message || "Failed to create client", 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
