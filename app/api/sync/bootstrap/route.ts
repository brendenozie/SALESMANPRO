import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import {
  verifyRegisteredDeviceAccess,
  getProvisionedStaffPinDigests,
  issueDeviceOfflineGrant,
} from "@/lib/sync/offlineGrantService";
import { getHeadSequence } from "@/lib/sync/changeLogService";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-POS-Device-Id, X-POS-Company-Id, X-POS-Store-Id, X-Offline-Grant",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/sync/bootstrap
 * Paginated initial data provisioning & cursor-expiration recovery endpoint.
 * Returns store settings, product catalog + authoritative stock, customers,
 * staff PIN digests, active POS session, and the current `headSequence` cursor.
 */
export const POST = withApiHandler(async (req, context) => {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedCompanyId =
      body.companyId || req.headers.get("x-pos-company-id") || undefined;
    const storeId =
      body.storeId || req.headers.get("x-pos-store-id") || null;
    const deviceId = (
      body.deviceId ||
      req.headers.get("x-pos-device-id") ||
      `DEV_${context.user?.id?.slice(-6) || "POS"}`
    ).trim();

    const tenantScope = await resolveAuthorizedCompany(
      context.user,
      requestedCompanyId
    );
    if (!tenantScope.authorized || !tenantScope.companyId) {
      return NextResponse.json(
        {
          success: false,
          code: "TENANT_ISOLATION_VIOLATION",
          error: tenantScope.error || "Forbidden: Unauthorized tenant scope",
        },
        { status: tenantScope.status || 403, headers: CORS_HEADERS }
      );
    }

    const companyId = tenantScope.companyId;

    const accessCheck = await verifyRegisteredDeviceAccess({
      companyId,
      deviceId,
    });
    if (!accessCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: accessCheck.code || "DEVICE_REVOKED",
          error: accessCheck.reason || "Device access denied",
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const page = Math.max(1, Number(body.page || 1));
    const pageSize = Math.max(50, Math.min(500, Number(body.pageSize || 250)));
    const skip = (page - 1) * pageSize;

    const [
      company,
      companySettings,
      kraConfig,
      listings,
      totalListings,
      inventoryItems,
      allocations,
      consumers,
      staffPinDigests,
      seqInfo,
      issuedGrant,
    ] = await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          logoUrl: true,
          address: true,
          contactPhone: true,
          contactEmail: true,
        },
      }),
      prisma.companySettings
        .findUnique({ where: { companyId } })
        .catch(() => null),
      prisma.kraConfiguration
        .findUnique({
          where: { companyId },
          select: {
            etimsEnabled: true,
            kraPin: true,
            branchId: true,
            deviceId: true,
            environment: true,
          },
        })
        .catch(() => null),
      prisma.marketplaceListings.findMany({
        where: {
          companyId,
          status: "ACTIVE",
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              model: true,
              quantity: true,
              sellingPrice: true,
              costPrice: true,
              discount: true,
              finalPrice: true,
              productCategoryId: true,
              ProductCategory: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.marketplaceListings.count({
        where: { companyId, status: "ACTIVE" },
      }),
      prisma.inventoryItem.findMany({
        where: { companyId },
        select: {
          id: true,
          productId: true,
          quantity: true,
          reorderThreshold: true,
        },
      }),
      prisma.stockAllocation
        .findMany({
          where: {
            companyId,
            deviceId,
            status: "ACTIVE",
          },
        })
        .catch(() => []),
      page === 1
        ? prisma.consumer.findMany({
            where: { companyId },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
                  address: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 500,
          })
        : Promise.resolve([]),
      page === 1 ? getProvisionedStaffPinDigests(companyId) : Promise.resolve([]),
      getHeadSequence(companyId),
      page === 1
        ? issueDeviceOfflineGrant({
            companyId,
            storeId,
            deviceId,
            platform: body.platform || "POS",
            appVersion: body.appVersion || "2.4.0",
            userId: context.user?.id || "",
            role: context.user?.role || "CASHIER",
          }).catch(() => null)
        : Promise.resolve(null),
    ]);

    const invByProductId = new Map<string, any>();
    for (const inv of inventoryItems) {
      invByProductId.set(inv.productId, inv);
    }

    const allocByListingId = new Map<string, any>();
    for (const alloc of allocations) {
      allocByListingId.set(alloc.marketplaceListingId, alloc);
    }

    const products = listings.map((item: any) => {
      const inv = item.productId ? invByProductId.get(item.productId) : null;
      const alloc = allocByListingId.get(item.id);
      const authoritativeStock = Number(
        inv?.quantity ?? item.quantity ?? item.product?.quantity ?? 0
      );
      const allocatedOfflineStock = alloc
        ? Math.max(0, Number(alloc.allocatedQty || 0) - Number(alloc.consumedQty || 0))
        : null;

      return {
        id: item.id,
        marketplaceListingId: item.id,
        productId: item.productId || item.product?.id || null,
        companyId,
        storeId: storeId || `store_${companyId}`,
        name: item.name || item.product?.name || "Unnamed Product",
        sku: item.product?.model || item.id.slice(-8).toUpperCase(),
        barcode: item.product?.model || item.id,
        price: Number(item.sellingPrice ?? item.product?.sellingPrice ?? 0),
        finalPrice: Number(
          item.finalPrice || item.sellingPrice || item.product?.sellingPrice || 0
        ),
        discount: Number(item.discount ?? item.product?.discount ?? 0),
        taxRate: 16,
        stock: authoritativeStock,
        cloudAuthoritativeStock: authoritativeStock,
        allocatedOfflineStock,
        reorderThreshold: inv?.reorderThreshold ?? 5,
        category: item.product?.ProductCategory?.name || "General",
        categoryId: item.product?.productCategoryId || null,
        image: Array.isArray(item.mainImage)
          ? item.mainImage[0]
          : item.mainImage || null,
        options: Array.isArray(item.option) ? item.option : [],
        pricingTiers: Array.isArray(item.pricingTiers) ? item.pricingTiers : [],
        isAvailable: item.isAvailable !== false && authoritativeStock > 0,
        version: 1,
        updatedAt: item.updatedAt ? item.updatedAt.toISOString() : new Date().toISOString(),
      };
    });

    const customers = consumers.map((c: any) => ({
      localCustomerId: c.id,
      serverId: c.id,
      userId: c.userId,
      companyId,
      name: c.user?.name || "Customer",
      phone: c.user?.phone || "",
      email: c.user?.email || "",
      address: c.user?.address || "",
      customerNumber: c.loginCode,
      loyaltyPoints: c.loyaltyPoints || 0,
      loyaltyTier: c.loyaltyTier || "BRONZE",
      syncStatus: "SYNCED",
      updatedAt: c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        protocolVersion: 1,
        company,
        settings: {
          currency: company?.currency || companySettings?.currency || "KES",
          offlineInventoryPolicy:
            (companySettings as any)?.offlineInventoryPolicy || "CONTROLLED",
          offlineGrantTtlHours:
            (companySettings as any)?.offlineGrantTtlHours || 168,
          offlineAllowanceBuffer:
            (companySettings as any)?.offlineAllowanceBuffer ?? 5,
          etimsEnabled: Boolean(kraConfig?.etimsEnabled),
          kraPin: kraConfig?.kraPin || null,
          branchId: kraConfig?.branchId || "00",
        },
        offlineGrant: issuedGrant?.grant || null,
        staffPinDigests,
        products,
        customers,
        pagination: {
          page,
          pageSize,
          totalListings,
          hasMore: skip + listings.length < totalListings,
        },
        headSequence: seqInfo.headSequence,
        minRetainedSequence: seqInfo.minRetainedSequence,
        serverTime: new Date().toISOString(),
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[SYNC_BOOTSTRAP_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Bootstrap provisioning failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

