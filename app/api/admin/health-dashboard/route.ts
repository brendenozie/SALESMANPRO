// app/api/admin/[adminSlug]/dashboard/summary/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const companyId = company.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    // Fetch Dashboard Data
    const totalPatients = await prisma.user.count({
      where: {
        company: { id: companyId },
        OR: [
          { role: "CLIENT" },
          { role: "CONSUMER" },
          { role: "STUDENT" },
          { role: "PARENT" },
        ],
      },
    });

    const upcomingAppointments = await prisma.appointment.count({
      where: {
        userId: { in: (await prisma.user.findMany({ where: { companyId: companyId, OR: [{ role: "CLIENT" }, { role: "CONSUMER" }, { role: "STUDENT" }, { role: "PARENT" }] }, select: { id: true } })).map(u => u.id) }, // Filter by users belonging to this company
        date: {
          gte: today,
        },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    const todayOrders = await prisma.customerOrder.findMany({
      where: {
        companyId: companyId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: { not: "CANCELLED" }, // Exclude cancelled orders
      },
      select: { totalPrice: true },
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    const activeDoctors = await prisma.educator.count({
      where: {
        companyId: companyId,
        // Assuming 'status' field on Educator or derived from related models
        // For now, just count all educators in the company
      },
    });

    // Mock new prescriptions as there's no direct Prescription model
    // In a real scenario, this would query a Prescription model.
    const newPrescriptions = Math.floor(Math.random() * 20) + 15; // Mock data

    // Fetch Recent Activity (simplified for dashboard)
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        userId: { in: (await prisma.user.findMany({ where: { companyId: companyId, OR: [{ role: "CLIENT" }, { role: "CONSUMER" }, { role: "STUDENT" }, { role: "PARENT" }] }, select: { id: true } })).map(u => u.id) },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        date: true,
        time: true, // Assuming time is part of date or separate field
        status: true,
        user: { select: { name: true } },
      },
    });

    const recentActivity = recentAppointments.map(appt => ({
      type: 'appointment_booked',
      details: `Appointment for ${appt.user?.name || 'N/A'} on ${new Date(appt.date).toLocaleDateString()} at ${appt.time || new Date(appt.date).toLocaleTimeString()}`,
      timestamp: appt.date.toISOString(),
    }));

    // Add mock recent patient registration
    recentActivity.push({
      type: 'patient_registered',
      details: 'New patient registered: John Doe',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    });

    return NextResponse.json({
      totalPatients,
      upcomingAppointments,
      todayRevenue,
      activeDoctors,
      newPrescriptions,
      recentActivity,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
