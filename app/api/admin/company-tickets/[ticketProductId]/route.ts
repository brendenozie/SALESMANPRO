// app/api/admin/[adminSlug]/tickets/[ticketProductId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET /api/admin/[adminSlug]/tickets/[ticketProductId]
export const GET = withApiHandler(
  async (request, { params }) => {
    const { adminSlug, ticketProductId } = params;

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    const ticketProduct = await prisma.marketplaceListings.findUnique({
      where: { id: ticketProductId, companyId: company.id },
      select: {
        id: true,
        name: true,
        description: true,
        sellingPrice: true,
        quantity: true,
        isAvailable: true,
        productCategory: { select: { name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!ticketProduct) {
      return formatResponse(false, null, "Ticket type not found", 404);
    }

    const eventName = "Associated Event Name (Needs lookup)"; // TODO: fetch actual event

    return formatResponse(true, {
      id: ticketProduct.id,
      eventName,
      type: ticketProduct.name,
      description: ticketProduct.description,
      price: ticketProduct.sellingPrice,
      quantity: ticketProduct.quantity,
      sold: Math.floor(ticketProduct.quantity * 0.6), // mock
      remaining: ticketProduct.quantity - Math.floor(ticketProduct.quantity * 0.6), // mock
      isAvailable: ticketProduct.isAvailable,
      createdAt: ticketProduct.createdAt,
      updatedAt: ticketProduct.updatedAt,
    });
  }
);

// PUT /api/admin/[adminSlug]/tickets/[ticketProductId]
export const PUT = withApiHandler(
  async (request, { params }) => {
    const { adminSlug, ticketProductId } = params;
    const body = await request.json();

    const { type, description, price, quantity, isAvailable } = body;

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    const updatedTicketProduct = await prisma.marketplaceListings.update({
      where: { id: ticketProductId, companyId: company.id },
      data: {
        name: type,
        description,
        sellingPrice: price ? parseFloat(price) : undefined,
        buyingPrice: price ? parseFloat(price) : undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
        isAvailable: isAvailable ?? undefined,
      },
    });

    return formatResponse(true, updatedTicketProduct, "Ticket type updated successfully");
  }
);

// DELETE /api/admin/[adminSlug]/tickets/[ticketProductId]
export const DELETE = withApiHandler(
  async (request, { params }) => {
    const { adminSlug, ticketProductId } = params;

    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    await prisma.marketplaceListings.delete({
      where: { id: ticketProductId, companyId: company.id },
    });

    return new NextResponse(null, { status: 204 });
  }
);
