import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import prisma from "@/server/db/prismadb";
import { unpublishProductFromMarketplace } from "@/lib/marketplace/publicationService";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const listing = await prisma.marketplaceListings.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Tenant check: ensure current user owns this company
    const userId = auth.user.id;
    if (listing.company.userId !== userId && auth.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not your listing" }, { status: 403 });
    }

    const updateData: any = {};

    if (body.status && ["ACTIVE", "INACTIVE", "ARCHIVED"].includes(body.status)) {
      updateData.status = body.status;
      updateData.listingSystemStatus = body.status;
    }

    if (typeof body.isAvailable === "boolean") {
      updateData.isAvailable = body.isAvailable;
      updateData.listingMarketStatus = body.isAvailable ? "AVAILABLE" : "OUT_OF_STOCK";
    }

    if (body.title || body.name) {
      const name = (body.title || body.name).trim();
      if (name.length >= 2) {
        updateData.name = name;
      }
    }

    if (body.description !== undefined) {
      updateData.description = (body.description || "").trim();
    }

    if (body.category) {
      updateData.category = body.category.trim();
    }

    if (body.productCategoryId) {
      updateData.productCategoryId = body.productCategoryId;
    }

    if (body.subCategoryName !== undefined) {
      updateData.subCategoryName = body.subCategoryName ? body.subCategoryName.trim() : null;
    }

    if (body.brand !== undefined) {
      updateData.brand = body.brand ? body.brand.trim() : null;
    }

    if (Array.isArray(body.images) && body.images.length > 0) {
      updateData.images = body.images;
    }

    if (Array.isArray(body.videos)) {
      updateData.videos = body.videos;
    }

    if (Array.isArray(body.ebooks)) {
      updateData.ebooks = body.ebooks;
    }

    if (body.price && Number(body.price) > 0) {
      updateData.sellingPrice = Number(body.price);
      updateData.finalPrice = Number(body.price);
    }

    if (body.stock != null && Number(body.stock) >= 0) {
      updateData.quantity = Number(body.stock);
      if (Number(body.stock) === 0) {
        updateData.isAvailable = false;
        updateData.listingMarketStatus = "OUT_OF_STOCK";
      }
    }

    const updated = await prisma.marketplaceListings.update({
      where: { id },
      data: updateData,
    });

    // Also sync back to internal Product record if attached
    if (listing.productId) {
      const productUpdate: any = {};
      if (updateData.name) productUpdate.name = updateData.name;
      if (updateData.description !== undefined) productUpdate.description = updateData.description;
      if (updateData.category) productUpdate.category = updateData.category;
      if (updateData.productCategoryId) productUpdate.productCategoryId = updateData.productCategoryId;
      if (updateData.subCategoryName !== undefined) productUpdate.subCategoryName = updateData.subCategoryName;
      if (updateData.brand !== undefined) productUpdate.brand = updateData.brand;
      if (updateData.images) productUpdate.images = updateData.images;
      if (updateData.videos) productUpdate.videos = updateData.videos;
      if (updateData.ebooks) productUpdate.ebooks = updateData.ebooks;

      if (updateData.sellingPrice) {
        productUpdate.sellingPrice = updateData.sellingPrice;
        productUpdate.price = updateData.sellingPrice;
        productUpdate.finalPrice = updateData.sellingPrice;
      }
      if (updateData.quantity != null) {
        productUpdate.quantity = updateData.quantity;
      }
      if (typeof updateData.isAvailable === "boolean") {
        productUpdate.isAvailable = updateData.isAvailable;
      }
      if (Object.keys(productUpdate).length > 0) {
        await prisma.product.update({
          where: { id: listing.productId },
          data: productUpdate,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully",
      listing: updated,
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/ghuba/seller/listings/[id]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const listing = await prisma.marketplaceListings.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const userId = auth.user.id;
    if (listing.company.userId !== userId && auth.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not your listing" }, { status: 403 });
    }

    // Call controlled domain service to unpublish and clean up public caches
    if (listing.productId) {
      await unpublishProductFromMarketplace(listing.productId, { actorId: userId });
    } else {
      await prisma.marketplaceListings.delete({
        where: { id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Listing deleted. 1 listing slot has been freed.",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/ghuba/seller/listings/[id]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete listing" },
      { status: 500 }
    );
  }
}
