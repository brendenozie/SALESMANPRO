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
      if (updateData.sellingPrice) {
        productUpdate.sellingPrice = updateData.sellingPrice;
        productUpdate.price = updateData.sellingPrice;
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
