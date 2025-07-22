// app/api/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust path if needed

// GET /api/products
// Fetches all products (dishes), optionally filtered by companyId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const products = await prisma.product.findMany({
      where: companyId ? { companyId } : {},
      include: {
        productCategory: {
          select: { name: true }, // Include category name for display
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to simplify the category object for the frontend
    const formattedProducts = products.map(product => ({
      ...product,
      category: product.productCategory ? { name: product.productCategory.name } : null,
      // Ensure images are correctly formatted if they are stored as JSON strings or different structure
      images: product.images as unknown as { url: string }[], // Cast Json to expected type
    }));

    return NextResponse.json(formattedProducts, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Failed to fetch products', error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/products
// Creates a new product (dish)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      images, // Expecting an array of { url: string }
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
      companyId, // Ensure companyId is provided in the body
    } = body;

    // Basic validation
    if (!name || !productCategoryId || !companyId || costPrice === undefined || sellingPrice === undefined) {
      return NextResponse.json({ message: 'Missing required fields: name, productCategoryId, companyId, costPrice, salesPrice' }, { status: 400 });
    }

    const finalPrice = sellingPrice * (1 - (discount || 0) / 100);

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        images: images || [], // Store as Json
        tags: [], // Default empty
        profitMargin: (sellingPrice - costPrice) / sellingPrice || 0,
        brand: 'Restaurant Brand', // Placeholder or dynamic
        company: { connect: { id: companyId } },
        productCategory: { connect: { id: productCategoryId } },
        costPrice,
        sellingPrice,
        finalPrice,
        discount: discount || 0,
        isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
        isOnOffer: typeof isOnOffer === 'boolean' ? isOnOffer : false,
        isFlashDeal: typeof isFlashDeal === 'boolean' ? isFlashDeal : false,
        isNewArrival: typeof isNewArrival === 'boolean' ? isNewArrival : false,
        isDiscounted: typeof isDiscounted === 'boolean' ? isDiscounted : (discount > 0),
        isFeatured: typeof isFeatured === 'boolean' ? isFeatured : false,
        ingredients,
        // Set other required fields from schema with sensible defaults or nulls
        model: null, color: [], size: [], weight: [], condition: null, dimensions: null, material: [],
        author: null, publisher: null, isbn: null, fabricComposition: null, careInstructions: null,
        energyRating: null, warrantyPeriod: null, applianceDimensions: null, usageInstructions: null, expirationDate: null,
        contact: null, location: null, amenities: [],
        delivery: false, paymentOption: "AT SHOP", showOnGhuba: true,
        subCategoryName: null, make: null, trim: null, type: null, mileage: null, engineType: null, engineSize: null,
        transmission: null, drivetrain: null, vin: null, logbookStatus: null, serviceHistory: null,
        digitalUrl: null, autoDeliver: false, negotiable: false, financingAvailable: false, tradeIn: false,
        tax: 0, shippingCost: 0,
        status: 'ACTIVE', // Default status for listing
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Failed to create product', error: (error as Error).message }, { status: 500 });
  }
}
