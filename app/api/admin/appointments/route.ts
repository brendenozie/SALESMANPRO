// app/api/admin/appointments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Assuming this path correctly points to your Prisma client initialization
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Helper function to format appointment data for the frontend
async function formatAppointmentData(appointment: any) {
  const patientName = appointment.user?.name || 'N/A';
  const doctorName = appointment.doctor?.user?.name || 'N/A';
  const dateObj = new Date(appointment.date);

  // Format date as YYYY-MM-DD
  const formattedDate = dateObj.toISOString().split('T')[0];

  // Format time as HH:MM AM/PM
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return {
    id: appointment.id,
    patientName: patientName,
    doctorId: appointment.doctorId, // Include doctorId for potential frontend use
    doctorName: doctorName,
    date: formattedDate,
    time: formattedTime,
    status: appointment.status,
    service: appointment.service || 'N/A',
    createdAt: appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString() : 'N/A',
  };
}

export async function GET(request: Request) {
  
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";
  const filterStatus = searchParams.get("filterStatus"); // 'Scheduled', 'Completed', 'Cancelled', 'All'

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

    let appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } }, // Patient's user data
        doctor: {
          include: {
            User: { select: { name: true } }, // Doctor's user data
          },
        },
      },
      orderBy: { date: 'asc' }, // Order by date
    });

    // Client-side filtering for search term across patient name, doctor name, and service
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      appointments = appointments.filter(appt =>
        appt.user?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        appt.doctor?.User?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        appt.service?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    const enrichedAppointments = await Promise.all(
      appointments.map(async (appt) => formatAppointmentData(appt))
    );

    return NextResponse.json(enrichedAppointments);
  } catch (err: any) {
    console.error("GET /api/admin/appointments error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, doctorId, service, date, time, status, companyId } = body;

  if (!userId || !doctorId || !date || !time || !status || !companyId) {
    return NextResponse.json(
      { error: "Missing required fields: userId, doctorId, date, time, status, companyId" },
      { status: 400 }
    );
  }

  try {
    // Combine date and time strings into a single Date object for Prisma
    const dateTimeString = `${date}T${time}:00`; // Assuming date is YYYY-MM-DD and time is HH:MM
    const appointmentDateTime = new Date(dateTimeString);

    const newAppointment = await prisma.appointment.create({
      data: {
        user:{
          connect:{id:userId}
        },
        doctorId,
        service,
        date: appointmentDateTime,
        status,
        company: { connect: { id: companyId } }, // Link to company
      },
      include: {
        user: { select: { name: true, email: true } },
        doctor: { include: { User: { select: { name: true } } } },
      },
    });

    const formattedNewAppointment = await formatAppointmentData(newAppointment);

    return NextResponse.json(formattedNewAppointment, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/appointments error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
