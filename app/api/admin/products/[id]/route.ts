import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/products/[id]/route.ts

import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// PUT /api/products/:id
export const PUT = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  
  const { id } = params;
  const body = await request.json();
  const {
    name,
    description,
    images,
    productCategoryId,
    costPrice,
    sellingPrice,
    discount,
    isAvailable,
    isOnOffer,
    isFlashDeal,
    isNewArrival,
    isDiscounted,
    isFeatured,
    ingredients,
  } = body;

  let finalPrice: number | undefined;

  if (sellingPrice !== undefined && discount !== undefined) {
    finalPrice = sellingPrice * (1 - discount / 100);
  } else if (sellingPrice !== undefined) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { discount: true },
    });
    finalPrice = sellingPrice * (1 - (existingProduct?.discount || 0) / 100);
  } else if (discount !== undefined) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { sellingPrice: true },
    });
    finalPrice = (existingProduct?.sellingPrice || 0) * (1 - discount / 100);
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name: name || undefined,
      description: description || undefined,
      images: images || undefined,
      productCategory: productCategoryId ? { connect: { id: productCategoryId } } : undefined,
      costPrice: costPrice !== undefined ? costPrice : undefined,
      sellingPrice: sellingPrice !== undefined ? sellingPrice : undefined,
      finalPrice: finalPrice !== undefined ? finalPrice : undefined,
      discount: discount !== undefined ? discount : undefined,
      isAvailable: typeof isAvailable === "boolean" ? isAvailable : undefined,
      isOnOffer: typeof isOnOffer === "boolean" ? isOnOffer : undefined,
      isFlashDeal: typeof isFlashDeal === "boolean" ? isFlashDeal : undefined,
      isNewArrival: typeof isNewArrival === "boolean" ? isNewArrival : undefined,
      isDiscounted: typeof isDiscounted === "boolean" ? isDiscounted : discount > 0,
      isFeatured: typeof isFeatured === "boolean" ? isFeatured : undefined,
      ingredients: ingredients || undefined,
      updatedAt: new Date(),
    },
  });

  
    try { await cacheDel(`admin:products:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedProduct, "Product updated successfully", 200);
});

// DELETE /api/products/:id
export const DELETE = withApiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  
  const { id } = params;

  await prisma.product.delete({
    where: { id },
  });

  
    try { await cacheDel(`admin:products:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "Product deleted successfully", 200);
});
