// app/api/users/route.ts
import prisma from "@/server/db/prismadb";
import { UserStatus, Plan, ROLES } from "@prisma/client";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// GET /api/users
// Fetches users with support for pagination, searching, and filtering.
async function handleGET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "10", 10);
    const skip = (page - 1) * perPage;

    // Search and Filter parameters
    const searchTerm = searchParams.get("search")?.toLowerCase() || "";
    const filterStatus = searchParams.get("status") as UserStatus | null;
    const filterPlan = searchParams.get("plan") as Plan | null;
    const filterRole = searchParams.get("role") as ROLES | null;

    const where: any = {};

    // Company filter
    const companyId = searchParams.get("companyId");
    if (companyId) {
      where.companyId = companyId;
    }

    // Search
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    // Filters
    if (filterStatus) where.status = filterStatus;
    if (filterPlan) where.plan = filterPlan;
    if (filterRole) where.role = filterRole;

    // Fetch total count for pagination
    const totalItems = await prisma.user.count({ where });

    // Fetch users
    const users = await prisma.user.findMany({
      skip,
      take: perPage,
      where,
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

    const totalPages = Math.ceil(totalItems / perPage);

    return formatResponse(true, {
      users,
      totalItems,
      totalPages,
      currentPage: page,
      perPage,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return formatResponse(false, null, error.message || "Failed to fetch users", 500);
  }
}

// POST /api/users
// Handles creating a new user
async function handlePOST(request: Request) {
  try {
    const { companyId, ...userData } = await request.json();

    if (!userData || !userData.email || !companyId) {
      return formatResponse(false, null, "Invalid request body or missing companyId", 400);
    }

    const newUser = await prisma.user.create({
      data: {
        ...userData,
        company: { connect: { id: companyId } },
      },
    });

    return formatResponse(true, newUser, "User created successfully", 201);
  } catch (error: any) {
    console.error("Error creating user:", error);

    if (error instanceof TypeError && (error as any).code === "ERR_INVALID_ARG_TYPE") {
      return formatResponse(
        false,
        null,
        "Failed to create user. Invalid request body format.",
        400
      );
    }

    return formatResponse(false, null, error.message || "Failed to create user", 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(handleGET);
export const POST = withApiHandler(handlePOST);
