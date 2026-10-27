import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import prisma from "@/server/db/prismadb";
import { enforceMarketplaceItemLimit } from "@/lib/subscriptions/enforce-limits";
import { publishProductToMarketplace } from "@/lib/marketplace/publicationService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.user.id;

    // Resolve seller's company
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { userId },
          ...(auth.user.companyId ? [{ id: auth.user.companyId }] : []),
        ],
      },
      select: { id: true, slug: true, name: true },
    });

    if (!company) {
      return NextResponse.json({ error: "No store found for this seller account." }, { status: 404 });
    }

    const listings = await prisma.marketplaceListings.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productId: true,
        name: true,
        description: true,
        sellingPrice: true,
        finalPrice: true,
        images: true,
        quantity: true,
        status: true,
        listingSystemStatus: true,
        listingMarketStatus: true,
        isAvailable: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
    const limit = 10;

    return NextResponse.json({
      success: true,
      listings,
      activeCount,
      totalCount: listings.length,
      limit,
      remainingSlots: Math.max(0, limit - activeCount),
    });
  } catch (error: any) {
    console.error("Error in GET /api/ghuba/seller/listings:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.user.id;

    // Resolve seller's company
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { userId },
          ...(auth.user.companyId ? [{ id: auth.user.companyId }] : []),
        ],
      },
      select: { id: true, slug: true, name: true, storeOrigin: true, showOnGhuba: true },
    });

    if (!company) {
      return NextResponse.json({ error: "No store found. Please create a store first." }, { status: 404 });
    }

    // 1. Authoritative limit check (Strict 10-item limit for Ghuba stores)
    const check = await enforceMarketplaceItemLimit(company.id, 1);
    if (!check.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: check.message,
          currentCount: check.currentCount,
          limit: check.limit,
          upgradeRequired: check.upgradeRequired,
          planName: check.planName,
        },
        { status: 403 }
      );
    }

    // 2. Parse payload
    const body = await req.json();
    const title = (body.name || body.title || "").trim();
    const price = Number(body.price || body.sellingPrice || 0);
    const stock = Number(body.stock || body.quantity || 1);
    const category = (body.category || "").trim() || "General Retail";
    const subCategoryName = (body.subCategoryName || body.subCategory || "").trim() || null;
    const brand = (body.brand || "").trim() || null;
    const description = (body.description || "").trim();
    const images: string[] = Array.isArray(body.images) ? body.images : [];

    if (!title || title.length < 2) {
      return NextResponse.json({ error: "Product title must be at least 2 characters long." }, { status: 400 });
    }
    if (price <= 0 || isNaN(price)) {
      return NextResponse.json({ error: "Please enter a valid price." }, { status: 400 });
    }
    if (images.length === 0) {
      return NextResponse.json({ error: "Please upload at least one product image." }, { status: 400 });
    }

    // Resolve or validate productCategoryId
    let validProductCategoryId: string | null = null;
    if (body.productCategoryId && typeof body.productCategoryId === "string" && body.productCategoryId.length === 24) {
      validProductCategoryId = body.productCategoryId;
    } else if (category) {
      try {
        const matchedCat = await prisma.productCategory.findFirst({
          where: {
            OR: [
              { name: { equals: category, mode: "insensitive" } },
              { slug: { equals: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"), mode: "insensitive" } },
            ],
          },
          select: { id: true },
        });
        if (matchedCat) {
          validProductCategoryId = matchedCat.id;
        }
      } catch {
        // Non-fatal
      }
    }

    const sku = `GHUBA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 3. Create internal warehouse Product with synchronized taxonomy
    const newProduct = await prisma.product.create({
      data: {
        name: title,
        sku,
        price,
        sellingPrice: price,
        finalPrice: price,
        quantity: stock,
        category,
        subCategoryName,
        brand,
        ...(validProductCategoryId ? { productCategoryId: validProductCategoryId } : {}),
        description,
        images,
        companyId: company.id,
        isAvailable: stock > 0,
        showOnGhuba: true,
        status: "ACTIVE",
      },
    });

    // 4. Publish to consumer-facing MarketplaceListings using canonical publication service
    const pubResult = await publishProductToMarketplace(newProduct.id, {
      actorId: userId,
      marketplacePrice: price,
      customTitle: title,
      customDescription: description,
      showOnGhuba: true,
    });

    if (!pubResult.success) {
      return NextResponse.json({
        error: pubResult.error || "Failed to publish listing to marketplace.",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Marketplace listing created successfully!",
      listingId: pubResult.listingId,
      productId: newProduct.id,
      product: newProduct,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/ghuba/seller/listings:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}
