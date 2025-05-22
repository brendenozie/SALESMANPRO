import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust as needed

// POST /api/product
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      companyId,
      sellerType,
      name,
      description,
      quantity,
      image,
      productCategoryId,
      category,
      subCategory,
      tags,
      brand,
      model,
      color,
      size,
      weight,
      condition,
      dimension,
      material,
      finalPrice,
      discount,
      isAvailable,
      isOnOffer,
      isFlashDeal,
      isNewArrival,
      isDiscounted,
      isFeatured,
      costPrice,
      salesPrice,
      startDealDate,
      endDealDate,
      author,
      publisher,
      isbn,
      fabricComposition,
      careInstructions,
      energyRating,
      warrantyPeriod,
      applianceDimensions,
      ingredients,
      usageInstructions,
      startDate,
      endDate,
      expirationDate,
      commissionRate,
      commissionType,
      contact,
      location
    } = body;

    // Validate required fields
    if (!name || !costPrice || !salesPrice || !companyId || !commissionType || commissionRate === undefined) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Parse numerical values
    const parsedCostPrice = parseFloat(costPrice);
    const parsedSalesPrice = parseFloat(salesPrice);
    const parsedCommissionRate = parseFloat(commissionRate);

    if (isNaN(parsedCostPrice) || isNaN(parsedSalesPrice) || isNaN(parsedCommissionRate)) {
      return NextResponse.json({ message: "Invalid number format for costPrice, salesPrice, or commissionRate." }, { status: 400 });
    }

    // Parse dates
    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const parsedEndDate = endDate ? new Date(endDate) : null;
    const parsedExpirationDate = expirationDate ? new Date(expirationDate) : null;

    const parsedTags = Array.isArray(tags) ? tags : [];

    let product;

    if (id) {
      // Update existing product
      product = await prisma.product.update({
        where: { id },
        data: {
          productCategory: { connect: { id: productCategoryId } },
          company: { connect: { id: companyId } },
          tags: parsedTags,
          name,
          description,
          costPrice: parsedCostPrice,
          salesPrice: parsedSalesPrice,
          finalPrice: finalPrice ?? 0,
          category,
          subCategory,
          brand,
          model,
          color,
          size,
          weight,
          discount,
          condition,
          dimension,
          material,
          isAvailable,
          isOnOffer,
          isFlashDeal,
          isNewArrival,
          isDiscounted,
          isFeatured,
          contact,
          location,
          author,
          publisher,
          isbn,
          fabricComposition,
          careInstructions,
          energyRating,
          warrantyPeriod,
          applianceDimensions,
          ingredients,
          usageInstructions,
          expirationDate: parsedExpirationDate,
          startDealDate,
          endDealDate,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new product
      product = await prisma.product.create({
        data: {
          productCategory: { connect: { id: productCategoryId } },
          company: { connect: { id: companyId } },
          tags: parsedTags,
          name,
          description,
          costPrice: parsedCostPrice,
          salesPrice: parsedSalesPrice,
          finalPrice: finalPrice ?? 0,
          category,
          subCategory,
          brand,
          model,
          color,
          size,
          weight,
          discount,
          condition,
          dimension,
          material,
          isAvailable,
          isOnOffer,
          isFlashDeal,
          isNewArrival,
          isDiscounted,
          isFeatured,
          contact,
          location,
          author,
          publisher,
          isbn,
          fabricComposition,
          careInstructions,
          energyRating,
          warrantyPeriod,
          applianceDimensions,
          ingredients,
          usageInstructions,
          expirationDate: parsedExpirationDate,
          startDealDate,
          endDealDate,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "ACTIVE",
        },
      });
    }

    // Upsert commission rate
    const commissionRateRecord = await prisma.commissionRate.upsert({
      where: { productId: product.id },
      update: {
        commissionType,
        commissionRate: parsedCommissionRate,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
      create: {
        productId: product.id,
        commissionType,
        commissionRate: parsedCommissionRate,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    });

    return NextResponse.json({ product, commissionRate: commissionRateRecord }, { status: 201 });
  } catch (error) {
    console.error("Product save error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
