// app/api/admin/[adminSlug]/tickets/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const eventIdFilter = searchParams.get("eventId");
  const searchKeyword = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "name"; // Assuming 'name' is ticket type
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const validSortBy = ["name", "sellingPrice", "quantity"]; // Assuming 'quantity' is on marketplaceListings
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const whereClause: any = {
      companyId: company.id,
      // Assuming event tickets have a specific productCategory
      productCategory: {
        name: "Event Tickets", // Adjust this to your actual category name/ID
      },
    };

    if (eventIdFilter) {
      // You'd need a way to link marketplaceListings to Events.
      // If Event ID is stored directly on marketplaceListings, use that.
      // Otherwise, you might need to filter based on products associated with an event.
      // For this example, let's assume a direct link or a way to infer.
      // This is a simplification and might need adjustment based on your exact data linking.
      // Example: where: { eventId: eventIdFilter } if you add eventId to marketplaceListings
    }

    if (searchKeyword) {
      whereClause.OR = [
        { name: { contains: searchKeyword, mode: 'insensitive' } },
        { description: { contains: searchKeyword, mode: 'insensitive' } },
      ];
    }

    const [tickets, totalItems] = await prisma.$transaction([
      prisma.marketplaceListings.findMany({ // Assuming tickets are marketplaceListings
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true, // Ticket type name
          sellingPrice: true, // Price
          quantity: true, // Total quantity
          // You might need to compute 'sold' and 'remaining' based on OrderItems
          // For simplicity, we'll mock or compute in frontend for now.
        },
      }),
      prisma.marketplaceListings.count({ where: whereClause }),
    ]);

    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      eventName: "Associated Event Name (Needs lookup)", // You'd need to link ticket to event
      type: ticket.name,
      price: ticket.sellingPrice,
      quantity: ticket.quantity,
      sold: Math.floor(ticket.quantity * 0.6), // Mocking sold
      remaining: ticket.quantity - Math.floor(ticket.quantity * 0.6), // Mocking remaining
    }));

    return NextResponse.json({
      tickets: formattedTickets,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching ticket types:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug } = params;
  const body = await request.json();

  const { eventId, type, description, price, quantity, isAvailable } = body; // 'type' maps to marketplaceListings.name

  if (!eventId || !type || !price || !quantity) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Find or create the 'Event Tickets' product category
    let eventTicketCategory = await prisma.productCategory.findFirst({
      where: { name: "Event Tickets", companyId: company.id },
    });

    if (!eventTicketCategory) {
      // Create a default category if it doesn't exist
      eventTicketCategory = await prisma.productCategory.create({
        data: {
          name: "Event Tickets",
          slug: "event-tickets",
          description: "Category for all event tickets.",
          longDescription: "Category for all event tickets.",
          seoTitle: "Event Tickets",
          seoDescription: "Event Tickets",
          metaKeywords: ["event", "tickets"],
          sortOrder: 100,
          visible: true,
          createdBy: "admin", // Replace with actual admin user ID
          updatedBy: "admin",
          status: "ACTIVE",
          allBrands: [],
          tags: [],
          subcategories: {}, // Empty JSON
          imageAlt: "Event Tickets",
          productCount: 0,
          isFeatured: false,
          showInHomepage: false,
          attributes: {},
          localization: {},
          companyId: company.id,
        },
      });
    }

    // Create a new marketplaceListing for the ticket type
    const newTicketProduct = await prisma.marketplaceListings.create({
      data: {
        companyId: company.id,
        name: type, // Ticket Type Name
        description: description || `Ticket for ${type}`,
        sellingPrice: parseFloat(price),
        buyingPrice: parseFloat(price), // Assuming buying price is same as selling for simplicity
        quantity: parseInt(quantity),
        isAvailable: isAvailable ?? true,
        productCategoryId: eventTicketCategory.id,
        category: eventTicketCategory.name, // Denormalize category name
        // Link to event: You might need to add an 'eventId' field to marketplaceListings
        // or Product if you want a direct link. For now, it's implied by category.
        // For a real system, you'd likely create a custom 'Ticket' model or extend Product.
        finalPrice: parseFloat(price),
        // Default values for required fields in marketplaceListings
        subCategory: {},
        tags: [],
        images: [],
        sellerType: "COMPANY", // Or 'ADMIN'
      },
    });

    // Update the productCount for the category
    await prisma.productCategory.update({
      where: { id: eventTicketCategory.id },
      data: { productCount: { increment: 1 } },
    });


    return NextResponse.json(
      { message: "Ticket type created successfully", ticket: newTicketProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ticket type:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}