import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed

// ... (Your existing parseJsonSafely and normalizeArray utilities) ...

// Existing POST export (just for context, don't duplicate if it's already there)
// export async function POST(req: Request) { ... }

// NEW: GET /api/marketplace-list
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Optional query parameters for filtering
    const id = searchParams.get("id");
    const companyId = searchParams.get("companyId");
    const productCategoryId = searchParams.get("productCategoryId"); // For filtering by service category
    const sellerId = searchParams.get("sellerId");
    const status = searchParams.get("status");
    const isAvailable = searchParams.get("isAvailable");
    const isOnOffer = searchParams.get("isOnOffer");
    const isFeatured = searchParams.get("isFeatured");
    const deliveryMethod = searchParams.get("deliveryMethod"); // New: for filtering services
    
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const page = parseInt(searchParams.get("page") || "0", 10);
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return NextResponse.json(
        { message: "Invalid pagination parameters." },
        { status: 400 }
      );
    }
  
    // Validate sellerId
    if (!companyId || typeof companyId !== "string") {
      return NextResponse.json({ message: "Invalid or missing sellerId." });
    }

    const where: any = {};

    if (id) {
      where.id = id;
    }
    if (companyId) {
      where.companyId = companyId;
    }
    if (productCategoryId) {
      where.productCategoryId = productCategoryId;
    }
    if (sellerId) {
      where.sellerId = sellerId;
    }
    if (status) {
      // Ensure status matches your Prisma enum values (e.g., 'ACTIVE', 'PENDING')
      where.status = status;
    }
    if (isAvailable !== null) {
      where.isAvailable = isAvailable === "true";
    }
    if (isOnOffer !== null) {
      where.isOnOffer = isOnOffer === "true";
    }
    if (isFeatured !== null) {
      where.isFeatured = isFeatured === "true";
    }
    if (deliveryMethod) {
      where.deliveryMethod = deliveryMethod;
    }

    // You can add more complex filtering or ordering here if needed
    // Example: filter by text in title or description
    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } } // Assuming tags are lowercase
      ];
    }

    // Fetch marketplace listings based on criteria
    const listings = await prisma.marketplaceListing.findMany({
      where,
      orderBy: {
        createdAt: 'desc', // Order by newest first
      },
      // You might want to select specific fields to limit payload size
      // select: {
      //   id: true,
      //   title: true,
      //   sellingPrice: true,
      //   // ... other essential fields
      // },
      // Include related data if necessary (e.g., productCategory name)
      include: {
        productCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        // You can include other relations like company, product, etc., if needed
        // company: true,
      },
    });

    return NextResponse.json(listings, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching marketplace listings:", error);
    return NextResponse.json(
      {
        message: "An error occurred while fetching marketplace listings.",
        error: error.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}