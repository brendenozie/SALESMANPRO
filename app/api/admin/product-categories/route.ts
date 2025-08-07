import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// GET: List all categories for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ message: "companyId is required" }, { status: 400 });
    }

    const categories = await prisma.productCategory.findMany({
      where: { companyId },
      orderBy: { sortOrder: "asc" }
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching product categories", error }, { status: 500 });
  }
}

// POST: Create a new product category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      name,
      icon,
      image,
      slug,
      description,
      longDescription,
      seoTitle,
      seoDescription,
      metaKeywords,
      sortOrder,
      visible,
      createdBy,
      updatedBy,
      status,
      allBrands,
      tags,
      subcategories,
      imageAlt,
      thumbnail,
      bannerImage,
      localization,
      productCount,
      isFeatured,
      showInHomepage,
      attributes,
      companyId,
    } = data;

    if (!name || !slug) {
      return NextResponse.json({ message: "Name and slug are required" }, { status: 400 });
    }

    const category = await prisma.productCategory.create({
      data: {
        name,
        icon,
        image,
        slug,
        description,
        longDescription,
        seoTitle,
        seoDescription,
        metaKeywords,
        sortOrder,
        visible,
        createdBy,
        updatedBy,
        status,
        allBrands,
        tags,
        subcategories,
        imageAlt,
        thumbnail,
        bannerImage,
        localization,
        productCount,
        isFeatured,
        showInHomepage,
        attributes,
        companyId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating category", error }, { status: 500 });
  }
}
