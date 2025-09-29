typescript
// app/api/product/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function createProduct(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const body = await req.json();
  const { name, description, category, tags, price, companyId, productCategoryId } = body;

  // Validate required fields
  if (!name || !price || !companyId) {
    return formatResponse(
      false,
      null,
      "Missing required fields: name, price, or companyId",
      400
    );
  }

  // Validate price
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice)) {
    return formatResponse(false, null, "Invalid number format for price", 400);
  }

  // Validate optional fields
  const parsedTags = Array.isArray(tags) ? tags : [];

  try {
    const result = await prisma.product.create({
      data: {
        name,
        description,
        category,
        tags: parsedTags,
        finalPrice: parsedPrice,
        companyId,
        productCategoryId,
      },
    });

    return formatResponse(true, result, "Product created successfully", 201);
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export const POST = withApiHandler(createProduct);

