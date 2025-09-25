// app/api/admin/[adminSlug]/tickets/[ticketProductId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; ticketProductId: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, ticketProductId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
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
      return NextResponse.json({ message: "Ticket type not found" }, { status: 404 });
    }

    // You might need to fetch the associated event name here if tickets are directly linked to events
    const eventName = "Associated Event Name (Needs lookup)"; // Placeholder

    return NextResponse.json({
      id: ticketProduct.id,
      eventName: eventName,
      type: ticketProduct.name,
      description: ticketProduct.description,
      price: ticketProduct.sellingPrice,
      quantity: ticketProduct.quantity,
      sold: Math.floor(ticketProduct.quantity * 0.6), // Mocking sold
      remaining: ticketProduct.quantity - Math.floor(ticketProduct.quantity * 0.6), // Mocking remaining
      isAvailable: ticketProduct.isAvailable,
      createdAt: ticketProduct.createdAt,
      updatedAt: ticketProduct.updatedAt,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ticket type:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; ticketProductId: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, ticketProductId } = params;
  const body = await request.json();

  const { type, description, price, quantity, isAvailable } = body;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
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

    return NextResponse.json(
      { message: "Ticket type updated successfully", ticket: updatedTicketProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating ticket type:", error);
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Ticket type not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { adminSlug: string; ticketProductId: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, ticketProductId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Delete the marketplaceListing (ticket type)
    await prisma.marketplaceListings.delete({
      where: { id: ticketProductId, companyId: company.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting ticket type:", error);
    if (error instanceof Error && error.message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Ticket type not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}