// app/api/admin/[adminSlug]/services/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const service = await prisma.marketplaceListings.findUnique({
      where: {
        id: id,
        companyId: company.id, // Ensure service belongs to this company
        status: "ACTIVE", // Only active services
      },
      select: {
        id: true,
        name: true,
        description: true,
        sellingPrice: true,
        duration: true,
        status: true,
        category: true,
        images: true,
        createdAt: true,
        updatedAt: true,
        productCategory: { select: { id: true, name: true } },
      },
    });

    if (!service) {
      return NextResponse.json({ message: "Service not found or not associated with this company" }, { status: 404 });
    }

    const formattedService = {
      ...service,
      price: service.sellingPrice,
      categoryId: service.productCategory?.id || null,
      categoryName: service.productCategory?.name || 'N/A',
      // Ensure images are in a usable format if stored as JSON
      images: service.images || [],
    };

    return NextResponse.json(formattedService, { status: 200 });

  } catch (error) {
    console.error("Error fetching service details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;
  const body = await request.json();

  const { name, description, price, duration, categoryId, status, images } = body;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const serviceToUpdate = await prisma.marketplaceListings.findUnique({
        where: {
            id: id,
            companyId: company.id,
        },
        select: { id: true }
    });

    if (!serviceToUpdate) {
        return NextResponse.json({ message: "Service not found or not associated with this company" }, { status: 404 });
    }

    let updateData: any = { updatedAt: new Date() };

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.sellingPrice = parseFloat(price);
    if (duration) updateData.duration = duration;
    if (status) updateData.status = status;
    if (images) updateData.images = images; // Assuming images are already in correct JSON format

    if (categoryId) {
        const productCategory = await prisma.productCategory.findUnique({
            where: { id: categoryId, companyId: company.id },
            select: { id: true, name: true }
        });
        if (!productCategory) {
            return NextResponse.json({ message: "New category not found or not associated with this company" }, { status: 404 });
        }
        updateData.productCategoryId = productCategory.id;
        updateData.category = productCategory.name;
    }

    const updatedService = await prisma.marketplaceListings.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Service updated successfully", service: updatedService },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const serviceToDelete = await prisma.marketplaceListings.findUnique({
        where: {
            id: id,
            companyId: company.id,
        },
        select: { id: true }
    });

    if (!serviceToDelete) {
        return NextResponse.json({ message: "Service not found or not associated with this company" }, { status: 404 });
    }

    // Consider soft delete (e.g., changing 'status' to 'ARCHIVED' or 'INACTIVE')
    // instead of hard delete in a real application, especially if linked to past orders.
    await prisma.marketplaceListings.update({
      where: { id: id },
      data: { status: "ARCHIVED" }, // Example of soft delete
    });

    return NextResponse.json({ message: "Service archived successfully" }, { status: 204 });

  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}