import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { revalidateCompanyCache } from "@/lib/company-fetcher";
import { cacheDel } from "@/lib/cache";

export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/super-admin/stores/showcase
// Retrieves all registered companies with their Ghuba showcase approval status and counts
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    const user = session?.user as any;
    const role = (user?.role || "").toUpperCase();

    if (!user?.id || (role !== "SUPER_ADMIN" && role !== "ADMIN" && user.email !== "brendenozie@gmail.com")) {
      return json({ success: false, message: "Super Admin authorization required" }, 403);
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // all | approved | pending
    const search = (searchParams.get("search") || "").trim();

    const whereClause: any = {
      slug: { notIn: ["ghuba", "admin", "www", "auth"] },
      category: { notIn: ["portal", "ghuba"] },
    };

    if (filter === "approved") {
      whereClause.showOnGhuba = true;
    } else if (filter === "pending") {
      whereClause.OR = [
        { showOnGhuba: false },
        { showOnGhuba: null },
      ];
    }

    if (search) {
      const searchCondition = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { domain: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ];

      if (whereClause.OR) {
        whereClause.AND = [
          { OR: whereClause.OR },
          { OR: searchCondition },
        ];
        delete whereClause.OR;
      } else {
        whereClause.OR = searchCondition;
      }
    }

    const [stores, totalCount, approvedCount] = await Promise.all([
      prisma.company.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          domain: true,
          category: true,
          variant: true,
          tagline: true,
          description: true,
          address: true,
          contactEmail: true,
          contactPhone: true,
          showOnGhuba: true,
          logoUrl: true,
          bannerUrl: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              marketplaceListings: {
                where: {
                  status: "ACTIVE",
                  isAvailable: true,
                },
              },
              Product: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }],
      }),
      prisma.company.count({
        where: {
          slug: { notIn: ["ghuba", "admin", "www", "auth"] },
          category: { notIn: ["portal", "ghuba"] },
        },
      }),
      prisma.company.count({
        where: {
          slug: { notIn: ["ghuba", "admin", "www", "auth"] },
          category: { notIn: ["portal", "ghuba"] },
          showOnGhuba: true,
        },
      }),
    ]);

    const pendingCount = totalCount - approvedCount;

    return json({
      success: true,
      stores,
      counts: {
        total: totalCount,
        approved: approvedCount,
        pending: pendingCount,
      },
    });
  } catch (error: any) {
    console.error("[SUPER_ADMIN_STORES_SHOWCASE_GET_ERROR]", error);
    return json({ success: false, message: error?.message || "Failed to load stores" }, 500);
  }
}

// POST /api/super-admin/stores/showcase
// Approve or revoke showcasing of a merchant store to Ghuba
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    const user = session?.user as any;
    const role = (user?.role || "").toUpperCase();

    if (!user?.id || (role !== "SUPER_ADMIN" && role !== "ADMIN" && user.email !== "brendenozie@gmail.com")) {
      return json({ success: false, message: "Super Admin authorization required" }, 403);
    }

    const body = await req.json();
    const { companyId, showOnGhuba } = body;

    if (!companyId || typeof showOnGhuba !== "boolean") {
      return json({ success: false, message: "companyId (string) and showOnGhuba (boolean) are required." }, 400);
    }

    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, slug: true, showOnGhuba: true },
    });

    if (!existingCompany) {
      return json({ success: false, message: "Store company not found." }, 404);
    }

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: { showOnGhuba },
      select: {
        id: true,
        name: true,
        slug: true,
        showOnGhuba: true,
        updatedAt: true,
      },
    });

    // Invalidate cached data for the store
    try {
      if (updated.slug) {
        await revalidateCompanyCache(updated.slug);
      }
      await cacheDel(`company:${companyId}:full`);
      await cacheDel(`ghuba:stores:directory`);
    } catch (cacheErr) {
      console.warn("[SHOWCASE_CACHE_CLEAR_WARN]", cacheErr);
    }

    return json({
      success: true,
      message: `Store "${updated.name}" is now ${showOnGhuba ? "approved and showcased on Ghuba" : "hidden from Ghuba showcase"}.`,
      store: updated,
    });
  } catch (error: any) {
    console.error("[SUPER_ADMIN_STORES_SHOWCASE_POST_ERROR]", error);
    return json({ success: false, message: error?.message || "Failed to update showcase status" }, 500);
  }
}
