// app/api/admin/[adminSlug]/services/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Helper function to format service data for the frontend
async function formatServiceData(service: any) {
  return {
    id: service.id,
    name: service.name,
    description: service.description || 'N/A',
    price: service.price,
    duration: service.duration,
    status: service.status,
    createdAt: service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A',
  };
}

// app/api/admin/services/[id]/route.ts
// This file handles GET, PUT, DELETE for a specific service by ID

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const formattedService = await formatServiceData(service);
    return NextResponse.json(formattedService);
  } catch (err: any) {
    console.error(`GET /api/admin/services/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const { name, description, price, duration, status } = body;

  try {
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: name,
        description: description,
        price: price ? parseFloat(price) : undefined, // Ensure price is a float if provided
        duration: duration,
        status: status,
      },
    });

    const formattedUpdatedService = await formatServiceData(updatedService);

    return NextResponse.json(formattedUpdatedService);
  } catch (err: any) {
    console.error(`PUT /api/admin/services/${id} error:`, err);
    // Handle unique constraint violation for companyId, name
    if (err.code === 'P2002' && err.meta?.target?.includes('name')) {
      return NextResponse.json({ error: "A service with this name already exists for this company." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error(`DELETE /api/admin/services/${id} error:`, err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
