// app/api/admin/[adminSlug]/reports/appointment-trends/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const period = searchParams.get("period") || "monthly"; // daily, weekly, monthly
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const companyId = company.id;

    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // Default to last 3 months for monthly, last 4 weeks for weekly, last 7 days for daily
      if (period === 'monthly') {
        endDate = new Date();
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 3);
      } else if (period === 'weekly') {
        endDate = new Date();
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 28); // Last 4 weeks
      } else { // daily
        endDate = new Date();
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7); // Last 7 days
      }
    }

    // Get all user IDs associated with this company
    const companyUserIds = (await prisma.user.findMany({
      where: {
        Company: { some: { id: companyId } }
      },
      select: { id: true }
    })).map(u => u.id);

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: { in: companyUserIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        status: true,
      },
    });

    const trendsData: { [key: string]: { total: number; completed: number; cancelled: number; scheduled: number } } = {};

    appointments.forEach(appt => {
      let key: string;
      const apptDate = new Date(appt.date);

      if (period === 'monthly') {
        key = `${apptDate.getFullYear()}-${(apptDate.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (period === 'weekly') {
        // Simple week calculation (might not align with ISO weeks)
        const firstDayOfYear = new Date(apptDate.getFullYear(), 0, 1);
        const pastDays = (apptDate.getTime() - firstDayOfYear.getTime()) / 86400000;
        key = `${apptDate.getFullYear()}-W${Math.ceil(pastDays / 7).toString().padStart(2, '0')}`;
      } else { // daily
        key = apptDate.toISOString().split('T')[0];
      }

      if (!trendsData[key]) {
        trendsData[key] = { total: 0, completed: 0, cancelled: 0, scheduled: 0 };
      }
      trendsData[key].total++;
      if (appt.status === 'COMPLETED') trendsData[key].completed++;
      else if (appt.status === 'CANCELED') trendsData[key].cancelled++;
      else if (appt.status === 'PENDING' || appt.status === 'CONFIRMED') trendsData[key].scheduled++;
    });

    const sortedKeys = Object.keys(trendsData).sort();
    const formattedData = sortedKeys.map(key => ({
      period: key,
      ...trendsData[key],
    }));

    return NextResponse.json({
      reportName: "Appointment Trends",
      period: `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      data: formattedData,
    }, { status: 200 });

  } catch (error) {
    console.error("Error generating appointment trends report:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}