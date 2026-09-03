import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
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
    if (!auth.success) return formatResponse(false, {}, auth.error, 401);

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

    const cacheKey = `admin:merged:${companyId || "global"}:p${page}:l${perPage}:s:${searchTerm}:${filterStatus || ""}:${filterRole || ""}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
    } catch (e) {
      console.error("Cache read error:", e);
    }

    // 1️⃣ Build Independent Where Clauses
    const userWhere: any = {};
    const consumerWhere: any = {};

    if (companyId) {
      userWhere.companyId = companyId;
      consumerWhere.companyId = companyId;
    }

    if (searchTerm) {
      userWhere.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ];
      // FIX: Query the relation for Consumer search
      consumerWhere.OR = [
        { user: { name: { contains: searchTerm, mode: "insensitive" } } },
        { user: { email: { contains: searchTerm, mode: "insensitive" } } },
        { user: { phone: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    if (filterStatus) {
      userWhere.status = filterStatus;
      consumerWhere.status = filterStatus;
    }
    if (filterPlan) userWhere.plan = filterPlan;
    if (filterRole) userWhere.role = filterRole;

    // 2️⃣ Schema Safety Check
    let canQueryUsers = true;
    try {
      if (companyId) {
        await prisma.user.count({ where: { companyId } });
      }
    } catch (err) {
      canQueryUsers = false;
    }

    // 3️⃣ Fetch Both Concurrently
    const [users, consumers] = await Promise.all([
      canQueryUsers
        ? prisma.user.findMany({
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
          })
        : Promise.resolve([]),
      prisma.consumer.findMany({
        where: consumerWhere,
        select: {
          id: true,
          status: true,
          type: true,
          stage: true,
          createdAt: true,
          // FIX: Select the related user data
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
    ]);

    // 4️⃣ Normalize and Merge Data
    const normalizedUsers = users.map((u) => ({ ...u, isConsumer: false }));

    const normalizedConsumers = consumers.map((c) => ({
      id: c.id,
      // FIX: Map the nested user data correctly
      name: c.user?.name || "Anonymous Consumer",
      email: c.user?.email || "N/A",
      phone: c.user?.phone || null,
      role: "CONSUMER",
      status: c.status || "ACTIVE",
      createdAt: c.createdAt,
      isConsumer: true,
      consumerProfile: {
        type: c.type,
        stage: c.stage,
      },
    }));

    const combinedItems = [...normalizedUsers, ...normalizedConsumers];

    // 5️⃣ Sort by Date (Newest First)
    combinedItems.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    // 6️⃣ In-Memory Pagination
    const totalItems = combinedItems.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const paginatedItems = combinedItems.slice(skip, skip + perPage);

    const responsePayload = {
      users: paginatedItems,
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
      source: "merged",
    };

    try {
      await cacheSet(cacheKey, responsePayload, 60);
    } catch (e) {
      console.error("Cache set error:", e);
    }

    return formatResponse(true, responsePayload, "Fetched Merged Records", 200);
  } catch (error: any) {
    console.error("Error fetching merged users/consumers:", error);
    // FIX: Replaced `null` with `{}` so the payload stringifier doesn't crash
    return formatResponse(
      false,
      {},
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
      await cacheDel(`tenant:${companyId}:users:*`);
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
