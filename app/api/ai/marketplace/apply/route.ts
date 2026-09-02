import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { AIPlatformError } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const {
      listingId,
      productId,
      name,
      description,
      tags,
      imageUrl,
      imageAction = "ADD_GALLERY", // "ADD_GALLERY" | "SET_FEATURED"
    } = body;

    if (!listingId && !productId) {
      return NextResponse.json(
        { success: false, error: "Either listingId or productId must be provided." },
        { status: 400 },
      );
    }

    let updatedRecord: any = null;

    // 1. Update Marketplace Listing
    if (listingId) {
      const listing = await prisma.marketplaceListings.findFirst({
        where: {
          id: listingId,
          companyId: auth.companyId,
        },
      });

      if (!listing) {
        return NextResponse.json(
          { success: false, error: "Marketplace listing not found or access denied." },
          { status: 404 },
        );
      }

      const updateData: any = {};
      if (name && typeof name === "string") updateData.name = name.trim();
      if (description && typeof description === "string") updateData.description = description.trim();
      if (Array.isArray(tags)) updateData.tags = tags;

      if (imageUrl && typeof imageUrl === "string") {
        const currentImages = Array.isArray(listing.images) ? [...listing.images] : [];
        if (imageAction === "SET_FEATURED") {
          updateData.images = [imageUrl, ...currentImages.filter((img) => img !== imageUrl)];
        } else {
          if (!currentImages.includes(imageUrl)) {
            updateData.images = [...currentImages, imageUrl];
          }
        }
      }

      updatedRecord = await prisma.marketplaceListings.update({
        where: { id: listingId },
        data: updateData,
      });

      // Also record an audit log
      await prisma.aIAuditLog.create({
        data: {
          companyId: auth.companyId,
          userId: auth.userId,
          action: "APPLY_TO_MARKETPLACE_LISTING",
          provider: "SYSTEM",
          model: "NONE",
          status: "SUCCESS",
          metadata: {
            listingId,
            fieldsUpdated: Object.keys(updateData),
          },
        },
      });
    }

    // 2. Update Product model if provided
    if (productId) {
      const product = await prisma.product.findFirst({
        where: {
          id: productId,
          companyId: auth.companyId,
        },
      });

      if (product) {
        const updateData: any = {};
        if (name && typeof name === "string") updateData.name = name.trim();
        if (description && typeof description === "string") updateData.description = description.trim();
        if (Array.isArray(tags)) updateData.tags = tags;

        if (imageUrl && typeof imageUrl === "string") {
          const currentImages = Array.isArray(product.images) ? [...product.images] : [];
          if (imageAction === "SET_FEATURED") {
            updateData.images = [imageUrl, ...currentImages.filter((img) => img !== imageUrl)];
          } else {
            if (!currentImages.includes(imageUrl)) {
              updateData.images = [...currentImages, imageUrl];
            }
          }
        }

        updatedRecord = await prisma.product.update({
          where: { id: productId },
          data: updateData,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully with AI generated content.",
      record: updatedRecord,
    });
  } catch (error: any) {
    console.error("[MARKETPLACE_APPLY_ERROR]", error);
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
