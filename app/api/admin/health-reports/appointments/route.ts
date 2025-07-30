// app/api/admin/reports/appointments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  const serviceName = searchParams.get("serviceName");
  const status = searchParams.get("status"); // 'PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'All'

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      companyId: companyId,
    };

    if (startDateParam) {
      whereClause.date = { ...whereClause.date, gte: new Date(startDateParam) };
    }
    if (endDateParam) {
      whereClause.date = { ...whereClause.date, lte: new Date(endDateParam) };
    }
    if (doctorId) {
      whereClause.doctorId = doctorId;
    }
    if (patientId) {
      whereClause.userId = patientId;
    }
    if (serviceName) {
      whereClause.service = serviceName; // Assuming 'service' is a string field
    }
    if (status && status !== 'All') {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } }, // Patient
        doctor: { include: { User: { select: { name: true } } } }, // Doctor
        OrderItem: { // Include related order items to see products sold/used
          select: {
            id: true,
            quantity: true,
            price: true,
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const appointmentSummary = appointments.map(appt => {
      const totalItemsRevenue = appt.OrderItem.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      return {
        id: appt.id,
        patientName: appt.user?.name || 'N/A',
        doctorName: appt.doctor?.User?.name || 'N/A',
        service: appt.service || 'N/A',
        date: appt.date ? new Date(appt.date).toISOString().split('T')[0] : 'N/A',
        status: appt.status,
        totalItemsRevenue: totalItemsRevenue,
        itemsUsed: appt.OrderItem.map(item => ({
          productName: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: appt.createdAt ? new Date(appt.createdAt).toLocaleDateString() : 'N/A',
      };
    });

    // Aggregate counts by status
    const statusCounts = appointments.reduce((acc, appt) => {
      acc[appt.status] = (acc[appt.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return NextResponse.json({
      summary: appointmentSummary,
      statusCounts: statusCounts,
      totalAppointments: appointments.length,
    });
  } catch (err: any) {
    console.error("GET /api/admin/reports/appointments error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
