// app/api/admin/[adminSlug]/events/[eventId]/check-in-attendees/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; eventId: string } }
) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { adminSlug, eventId } = params;
  const { searchParams } = new URL(request.url);
  const searchKeyword = searchParams.get("search");
  const statusFilter = searchParams.get("status"); // 'ATTENDED' or 'REGISTERED'

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const whereClause: any = {
      eventId: eventId,
      companyId: company.id,
    };

    if (searchKeyword) {
      whereClause.OR = [
        { user: { name: { contains: searchKeyword, mode: 'insensitive' } } },
        { user: { email: { contains: searchKeyword, mode: 'insensitive' } } },
      ];
    }

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const attendees = await prisma.eventRegistration.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        // You might need to include OrderItem/marketplaceListing to get ticketType
      },
      orderBy: { user: { name: 'asc' } } // Order alphabetically
    });

    const formattedAttendees = attendees.map(reg => ({
      id: reg.id,
      name: reg.user?.name || 'N/A',
      email: reg.user?.email || 'N/A',
      ticketType: "General Admission", // Mocking, needs actual lookup from OrderItem/Product
      checkedIn: reg.status === "ATTENDED", // Map Prisma status to simple boolean
      status: reg.status,
    }));

    return NextResponse.json(formattedAttendees, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendees for check-in:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}