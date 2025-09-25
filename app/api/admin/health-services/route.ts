// app/api/admin/services/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Assuming this path correctly points to your Prisma client initialization
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

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

export async function GET(request: Request) {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus"); // 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'All'

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      companyId: companyId,
    };

    if (filterStatus && filterStatus !== 'All') {
      whereClause.status = filterStatus;
    }

    let services = await prisma.service.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }, // Order by service name
    });

    // Client-side filtering for search term across name and description
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      services = services.filter(service =>
        service.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        service.description?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    const formattedServices = await Promise.all(
      services.map(async (service) => formatServiceData(service))
    );

    return NextResponse.json(formattedServices);
  } catch (err: any) {
    console.error("GET /api/admin/services error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const body = await request.json();
  const { name, description, price, duration, status, companyId } = body;

  if (!name || !price || !duration || !companyId) {
    return NextResponse.json(
      { error: "Missing required fields: name, price, duration, companyId" },
      { status: 400 }
    );
  }

  try {
    const newService = await prisma.service.create({
      data: {
        companyId: companyId,
        name: name,
        description: description,
        price: parseFloat(price), // Ensure price is a float
        duration: duration,
        status: status || 'ACTIVE', // Default to ACTIVE if not provided
      },
    });

    const formattedNewService = await formatServiceData(newService);

    return NextResponse.json(formattedNewService, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/services error:", err);
    // Handle unique constraint violation for companyId, name
    if (err.code === 'P2002' && err.meta?.target?.includes('name')) {
      return NextResponse.json({ error: "A service with this name already exists for this company." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
