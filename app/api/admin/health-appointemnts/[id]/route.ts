// app/api/admin/[adminSlug]/appointments/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Get all user IDs associated with this company
    const companyUserIds = (await prisma.user.findMany({
      where: {
        Company: { some: { id: company.id } }
      },
      select: { id: true }
    })).map(u => u.id);

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: id,
        userId: { in: companyUserIds }, // Ensure appointment belongs to a user of this company
      },
      select: {
        id: true,
        date: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        OrderItem: {
          select: {
            marketplaceListing: { select: { id: true, name: true, sellingPrice: true } }
          }
        }
        // Include doctor details if you add a doctor relation to Appointment
      },
    });

    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found or not associated with this company" }, { status: 404 });
    }

    const formattedAppointment = {
      ...appointment,
      patientName: appointment.user?.name || 'N/A',
      patientEmail: appointment.user?.email || 'N/A',
      patientPhone: appointment.user?.phone || 'N/A',
      // Doctor name needs to be linked through the appointment or OrderItem if it's a service
      doctorName: 'N/A', // Placeholder: Needs proper relation in schema
      service: appointment.OrderItem[0]?.marketplaceListing?.name || 'N/A Service',
      serviceId: appointment.OrderItem[0]?.marketplaceListing?.id || null,
      servicePrice: appointment.OrderItem[0]?.marketplaceListing?.sellingPrice || 0,
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    return NextResponse.json(formattedAppointment, { status: 200 });

  } catch (error) {
    console.error("Error fetching appointment details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;
  const body = await request.json();

  const { date, time, status, serviceId, notes } = body;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Get all user IDs associated with this company
    const companyUserIds = (await prisma.user.findMany({
      where: {
        Company: { some: { id: company.id } }
      },
      select: { id: true }
    })).map(u => u.id);

    const appointmentToUpdate = await prisma.appointment.findUnique({
        where: {
            id: id,
            userId: { in: companyUserIds },
        },
        select: { id: true }
    });

    if (!appointmentToUpdate) {
        return NextResponse.json({ message: "Appointment not found or not associated with this company" }, { status: 404 });
    }

    let updateData: any = { updatedAt: new Date() };

    if (date && time) {
      updateData.date = new Date(`${date}T${time}`);
    } else if (date) {
      updateData.date = new Date(date);
    }
    if (status) {
      updateData.status = status;
    }
    // If you have a notes field on Appointment model, add it here
    // if (notes) { updateData.notes = notes; }

    // If serviceId is updated, you might need to update the OrderItem linked to this appointment
    // This is more complex and depends on whether an appointment can change its primary service
    // For simplicity, this example only updates the appointment itself.

    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Appointment updated successfully", appointment: updatedAppointment },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Get all user IDs associated with this company
    const companyUserIds = (await prisma.user.findMany({
      where: {
        Company: { some: { id: company.id } }
      },
      select: { id: true }
    })).map(u => u.id);

    const appointmentToDelete = await prisma.appointment.findUnique({
        where: {
            id: id,
            userId: { in: companyUserIds },
        },
        select: { id: true }
    });

    if (!appointmentToDelete) {
        return NextResponse.json({ message: "Appointment not found or not associated with this company" }, { status: 404 });
    }

    // Delete associated OrderItems first if onDelete is not Cascade
    await prisma.orderItem.deleteMany({
        where: { appointmentId: id }
    });

    await prisma.appointment.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Appointment deleted successfully" }, { status: 204 });

  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
