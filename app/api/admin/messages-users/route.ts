import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { UserStatus, Plan, ROLES } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// GET /api/users
async function handleGET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "10", 10);
    const skip = (page - 1) * perPage;

    // Filters
    const searchTerm = searchParams.get("search")?.toLowerCase() || "";
    const filterStatus = searchParams.get("status") as UserStatus | null;
    const filterPlan = searchParams.get("plan") as Plan | null;
    const filterRole = searchParams.get("role") as ROLES | null;
    const companyId = searchParams.get("companyId");

    const cacheKey = `admin:users:${companyId || "global"}:p${page}:l${perPage}:s:${searchTerm}:${filterStatus || ""}:${filterRole || ""}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {
      console.error("Cache read error:", e);
    }

    let items: any[] = [];
    let totalItems = 0;
    let source: "users" | "consumers" = "users";

    // 1️⃣ Primary attempt: Query User table
    const userWhere: any = {};
    if (companyId) userWhere.companyId = companyId;

    if (searchTerm) {
      userWhere.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    if (filterStatus) userWhere.status = filterStatus;
    if (filterPlan) userWhere.plan = filterPlan;
    if (filterRole) userWhere.role = filterRole;

    let userCount = 0;
    try {
      userCount = await prisma.user.count({ where: userWhere });
    } catch (err) {
      // Catch schema mismatches (e.g., if companyId field doesn't exist on User)
      userCount = 0;
    }

    if (userCount > 0) {
      // Users found
      totalItems = userCount;
      const users = await prisma.user.findMany({
        skip,
        take: perPage,
        where: userWhere,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      items = users.map((u) => ({ ...u, isConsumer: false }));
    } else {
      // 2️⃣ Fallback: User count is 0 -> Query Consumer table
      source = "consumers";
      const consumerWhere: any = {};
      if (companyId) consumerWhere.companyId = companyId;

      if (searchTerm) {
        consumerWhere.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
        ];
      }

      if (filterStatus) consumerWhere.status = filterStatus;

      totalItems = await prisma.consumer.count({ where: consumerWhere });

      const consumers = await prisma.consumer.findMany({
        skip,
        take: perPage,
        where: consumerWhere,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          type: true,
          stage: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Normalize consumer schema into standard user shape
      items = consumers.map((c) => ({
        id: c.id,
        name: c.name || "Anonymous Consumer",
        email: c.email || "N/A",
        phone: c.phone || null,
        role: "CONSUMER",
        status: c.status || "ACTIVE",
        createdAt: c.createdAt,
        isConsumer: true,
        consumerProfile: {
          type: c.type,
          stage: c.stage,
        },
      }));
    }

    const totalPages = Math.ceil(totalItems / perPage);
    const responsePayload = {
      users: items,
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
      source,
    };

    try {
      await cacheSet(cacheKey, responsePayload, 60);
    } catch (e) {
      console.error("Cache set error:", e);
    }

    return formatResponse(true, responsePayload, "Fetched", 200);
  } catch (error: any) {
    console.error("Error fetching users/consumers:", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to fetch records",
      500,
    );
  }
}

// POST /api/users
async function handlePOST(request: Request) {
  try {
    const { companyId, ...userData } = await request.json();

    if (!userData || !userData.email) {
      return formatResponse(
        false,
        null,
        "Invalid request body or missing email",
        400,
      );
    }

    const newUser = await prisma.user.create({
      data: {
        ...userData,
        ...(companyId ? { company: { connect: { id: companyId } } } : {}),
      },
    });

    try {
      await cacheDel(`admin:users:*`);
    } catch (e) {
      console.error("Error deleting cached entries:", e);
    }

    return formatResponse(true, newUser, "User created successfully", 201);
  } catch (error: any) {
    console.error("Error creating user:", error);

    if (
      error instanceof TypeError &&
      (error as any).code === "ERR_INVALID_ARG_TYPE"
    ) {
      return formatResponse(
        false,
        null,
        "Failed to create user. Invalid request body format.",
        400,
      );
    }

    return formatResponse(
      false,
      null,
      error.message || "Failed to create user",
      500,
    );
  }
}

export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
