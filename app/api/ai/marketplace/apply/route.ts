import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { AIPlatformError } from "@/lib/ai/types";
import {
  syncProductToMarketplaceListings,
  syncListingToProduct,
} from "@/lib/marketplace/syncProductToListing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const {
      listingId,
      productId,
      targetType, // "PRODUCT" | "LISTING" | "BOTH"
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

    // Determine resolved target
    const effectiveTarget = targetType || (listingId && !productId ? "LISTING" : productId && !listingId ? "PRODUCT" : "BOTH");

    let updatedRecord: any = null;

    // 1. Update Marketplace Listing if targeted
    if ((effectiveTarget === "LISTING" || effectiveTarget === "BOTH") && (listingId || productId)) {
      const targetListing = listingId
        ? await prisma.marketplaceListings.findFirst({
            where: { id: listingId, companyId: auth.companyId },
          })
        : await prisma.marketplaceListings.findFirst({
            where: { productId, companyId: auth.companyId },
          });

      if (targetListing) {
        const updateData: any = {};
        if (name && typeof name === "string") updateData.name = name.trim();
        if (description && typeof description === "string") updateData.description = description.trim();
        if (Array.isArray(tags)) updateData.tags = tags;

        if (imageUrl && typeof imageUrl === "string") {
          const currentImages = Array.isArray(targetListing.images) ? [...targetListing.images] : [];
          if (imageAction === "SET_FEATURED") {
            updateData.images = [imageUrl, ...currentImages.filter((img) => img !== imageUrl)];
          } else {
            if (!currentImages.includes(imageUrl)) {
              updateData.images = [...currentImages, imageUrl];
            }
          }
        }

        updatedRecord = await prisma.marketplaceListings.update({
          where: { id: targetListing.id },
          data: updateData,
        });

        await prisma.aIAction.create({
          data: {
            companyId: auth.companyId,
            userId: auth.userId,
            action: "APPLY_TO_MARKETPLACE_LISTING",
            provider: "SYSTEM",
            model: "NONE",
            status: "SUCCESS",
            metadata: {
              listingId: targetListing.id,
              fieldsUpdated: Object.keys(updateData),
            },
          },
        });
      }
    }

    // 2. Update Product model if targeted
    if ((effectiveTarget === "PRODUCT" || effectiveTarget === "BOTH") && (productId || listingId)) {
      let resolvedProdId = productId;
      if (!resolvedProdId && listingId) {
        const list = await prisma.marketplaceListings.findUnique({
          where: { id: listingId },
          select: { productId: true },
        });
        resolvedProdId = list?.productId || undefined;
      }

      if (resolvedProdId) {
        const product = await prisma.product.findFirst({
          where: {
            id: resolvedProdId,
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

          const updatedProd = await prisma.product.update({
            where: { id: resolvedProdId },
            data: updateData,
          });

          if (!updatedRecord) {
            updatedRecord = updatedProd;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Content applied successfully to target: ${effectiveTarget}.`,
      record: updatedRecord,
      targetType: effectiveTarget,
    });
  } catch (error: any) {
    console.error("[MARKETPLACE_APPLY_ERROR]", error);
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
