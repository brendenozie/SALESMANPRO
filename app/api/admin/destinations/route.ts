import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// =======================================================================
// GET all products (destinations)
// Endpoint: /api/products
// =======================================================================
export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc', // Assuming a createdAt field exists
      },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products', error: (error as Error).message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

// =======================================================================
// POST a new product (destination)
// Endpoint: /api/products
// =======================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      longDescription,
      images,
      tags,
      brand,
      companyId,
      productCategoryId,
      model,
      color,
      size,
      weight,
      condition,
      dimensions,
      material,
      quantity,
      costPrice,
      sellingPrice,
      discount,
      finalPrice,
      profitMargin,
      pricingTiers,
      isOnOffer,
      isFlashDeal,
      isDiscounted,
      startDealDate,
      endDealDate,
      isAvailable,
      isNewArrival,
      isFeatured,
      make,
      trim,
      type,
      mileage,
      engineType,
      engineSize,
      horsepower,
      torque,
      fuelType,
      fuelEconomy,
      transmission,
      drivetrain,
      vin,
      logbookStatus,
      serviceHistory,
      negotiable,
      financingAvailable,
      tradeIn,
      features,
      previousOwners,
      tireCondition,
      accidentalHistory,
    } = body;

    // Basic validation: Ensure required fields are present
    if (!name) {
      return NextResponse.json(
        { message: 'Missing required field: name.' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        longDescription,
        images,
        tags,
        brand,
        companyId,
        productCategoryId,
        model,
        color,
        size,
        weight,
        condition,
        dimensions,
        material,
        quantity,
        costPrice,
        sellingPrice,
        discount,
        finalPrice,
        profitMargin,
        pricingTiers,
        isOnOffer,
        isFlashDeal,
        isDiscounted,
        startDealDate: startDealDate ? new Date(startDealDate) : null,
        endDealDate: endDealDate ? new Date(endDealDate) : null,
        isAvailable,
        isNewArrival,
        isFeatured,
        make,
        trim,
        type,
        mileage,
        engineType,
        engineSize,
        horsepower,
        torque,
        fuelType,
        fuelEconomy,
        transmission,
        drivetrain,
        vin,
        logbookStatus,
        serviceHistory,
        negotiable,
        financingAvailable,
        tradeIn,
        features,
        previousOwners,
        tireCondition,
        accidentalHistory,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Failed to create product', error: (error as Error).message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
