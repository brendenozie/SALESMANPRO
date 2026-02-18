import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// --------------------
// Formatter (sync)
// --------------------
function formatAppointmentData(appointment: any) {
  const patientName = appointment.user?.name ?? "N/A";
  const doctorName = appointment.doctor?.User?.name ?? "N/A";

  const dateObj = new Date(appointment.date);

  return {
    id: appointment.id,
    patientName,
    doctorId: appointment.doctorId,
    doctorName,
    date: dateObj.toISOString().split("T")[0],
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    status: appointment.status,
    service: appointment.service ?? "N/A",
    createdAt: appointment.createdAt
      ? new Date(appointment.createdAt).toLocaleDateString()
      : "N/A",
  };
}

const baseSelect = {
  id: true,
  doctorId: true,
  date: true,
  status: true,
  service: true,
  createdAt: true,
  user: { select: { name: true, email: true } },
  doctor: { select: { User: { select: { name: true } } } },
};

// --------------------
// GET
// --------------------
export const GET = withApiHandler(async (_request, context) => {
  const { id } = context.params;
  const { user } = context;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appointment = await prisma.appointment.findFirst({
    where:
      user.role === "ADMIN"
        ? { id }
        : { id, doctorId: user.id },
    select: baseSelect,
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  return NextResponse.json(formatAppointmentData(appointment), { status: 200 });
});

// --------------------
// PUT
// --------------------
export const PUT = withApiHandler(async (request, context) => {
  const { id } = context.params;
  const { user } = context;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId, doctorId, service, date, time, status } = body;

  const existing = await prisma.appointment.findFirst({
    where:
      user.role === "ADMIN"
        ? { id }
        : { id, doctorId: user.id },
    select: { date: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const updateData: any = {
    ...(service !== undefined && { service }),
    ...(status !== undefined && { status }),
    ...(userId && { userId }),
    ...(doctorId && user.role === "ADMIN" && { doctorId }),
  };

  if (date || time) {
    const base = new Date(existing.date);

    const newDate = date ?? base.toISOString().split("T")[0];
    const newTime =
      time ??
      base.toISOString().split("T")[1].slice(0, 5); // HH:mm

    updateData.date = new Date(`${newDate}T${newTime}:00`);
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: updateData,
    select: baseSelect,
  });

  
    try { await cacheDel(`admin:appointments:${'global' || 'global'}:*`); } catch (e) {}
    return NextResponse.json(formatAppointmentData(updated), { status: 200 });
});

// --------------------
// DELETE
// --------------------
export const DELETE = withApiHandler(async (_request, context) => {
  const { id } = context.params;
  const { user } = context;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.appointment.deleteMany({
    where:
      user.role === "ADMIN"
        ? { id }
        : { id, doctorId: user.id },
  });

  if (!deleted.count) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  
    try { await cacheDel(`admin:appointments:${'global' || 'global'}:*`); } catch (e) {}
    return NextResponse.json({ message: "Appointment deleted successfully" }, { status: 200 });
});
// import { NextResponse } from "next/server";
,
//     status: appt.status,
//     service: appt.service ?? "N/A",
//     createdAt: appt.createdAt?.toISOString() ?? "N/A",
//   };
// }

// export const GET = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;

//   // OPTIMIZATION: Use findFirst with combined role logic to save an IF/ELSE block
//   const appointment = await prisma.appointment.findFirst({
//     where: {
//       id,
//       ...(user?.role !== "ADMIN" ? { doctorId: user.id } : {}),
//     },
//     select: {
//       id: true, date: true, status: true, service: true, createdAt: true, doctorId: true,
//       user: { select: { name: true } },
//       doctor: { select: { User: { select: { name: true } } } },
//     },
//   });

//   if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

//   return NextResponse.json(formatAppointment(appointment), { status: 200 });
// });

// export const PUT = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;
//   const { userId, doctorId, service, date, time, status } = await request.json();

//   try {
//     // OPTIMIZATION: Direct update with ownership check in 'where'
//     // If Admin, they bypass the doctorId filter.
//     const updatePayload: any = { service, status };
//     if (userId) updatePayload.userId = userId;
//     if (doctorId && user?.role === "ADMIN") updatePayload.doctorId = doctorId;

//     if (date || time) {
//       // Small fetch here is necessary only if we need the OLD date to merge with a NEW time
//       const current = await prisma.appointment.findUnique({ where: { id }, select: { date: true } });
//       if (current) {
//         const dPart = date || current.date.toISOString().split("T")[0];
//         const tPart = time || current.date.toISOString().split("T")[1].substring(0, 5);
//         updatePayload.date = new Date(`${dPart}T${tPart}:00`);
//       }
//     }

//     const updated = await prisma.appointment.update({
//       where: { 
//         id, 
//         ...(user?.role !== "ADMIN" ? { doctorId: user.id } : {}) 
//       },
//       data: updatePayload,
//       include: {
//         user: { select: { name: true } },
//         doctor: { include: { User: { select: { name: true } } } }
//       }
//     });

//     return NextResponse.json(formatAppointment(updated), { status: 200 });
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
//     }
//     throw error;
//   }
// });

// export const DELETE = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;

//   try {
//     // OPTIMIZATION: Atomic Delete (1 DB call instead of 2)
//     await prisma.appointment.delete({
//       where: { 
//         id, 
//         ...(user?.role !== "ADMIN" ? { doctorId: user.id } : {}) 
//       },
//     });
//     return NextResponse.json({ message: "Deleted" }, { status: 200 });
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
//       return NextResponse.json({ error: "Access denied or not found" }, { status: 404 });
//     }
//     throw error;
//   }
// });
// import { NextResponse } from "next/server";


//   return {
//     id: appointment.id,
//     patientName,
//     doctorId: appointment.doctorId,
//     doctorName,
//     date: formattedDate,
//     time: formattedTime,
//     status: appointment.status,
//     service: appointment.service || "N/A",
//     createdAt: appointment.createdAt
//       ? new Date(appointment.createdAt).toLocaleDateString()
//       : "N/A",
//   };
// }

// // --- GET /api/admin/appointments/[id]
// export const GET = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;

//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const appointment = await prisma.appointment.findFirst({
//     where: context.user?.role === "ADMIN"
//       ? { id }
//       : { id, doctorId: user.id }, // doctors can only see their own
//     include: {
//       user: { select: { name: true, email: true } },
//       doctor: { include: { User: { select: { name: true } } } },
//     },
//   });

//   if (!appointment) {
//     return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
//   }

//   const formattedAppointment = await formatAppointmentData(appointment);
//   return NextResponse.json(formattedAppointment, { status: 200 });
// });

// // --- PUT /api/admin/appointments/[id]
// export const PUT = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;

//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const body = await request.json();

//   const { userId, doctorId, service, date, time, status } = body;

//   // Ensure doctor can only update their own appointment
//   const existingAppointment = await prisma.appointment.findFirst({
//     where: user?.role === "ADMIN"
//       ? { id }
//       : { id, doctorId: user.id },
//   });

//   if (!existingAppointment) {
//     return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
//   }

//   let updateData: any = { service, status };
//   if (userId) updateData.userId = userId;
//   if (doctorId && user?.role === "ADMIN") {
//     // only admin can reassign doctor
//     updateData.doctorId = doctorId;
//   }

//   // Handle combined date+time updates
//   if (date || time) {
//     const existingDate = new Date(existingAppointment.date);
//     const newDatePart = date || existingDate.toISOString().split("T")[0];
//     const newTimePart =
//       time ||
//       existingDate.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hourCycle: "h23", // keep 24-hour format internally
//       });

//     updateData.date = new Date(`${newDatePart}T${newTimePart}:00`);
//   }

//   const updatedAppointment = await prisma.appointment.update({
//     where: { id },
//     data: updateData,
//     include: {
//       user: { select: { name: true, email: true } },
//       doctor: { include: { User: { select: { name: true } } } },
//     },
//   });

//   const formattedUpdatedAppointment = await formatAppointmentData(updatedAppointment);
//   return NextResponse.json(formattedUpdatedAppointment, { status: 200 });
// });

// // --- DELETE /api/admin/appointments/[id]
// export const DELETE = withApiHandler(async (request, context) => {
//   const { id } = context.params;
//   const { user } = context;

//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // Ensure doctor can only delete their own appointment
//   const existingAppointment = await prisma.appointment.findFirst({
//     where: user?.role === "ADMIN"
//       ? { id }
//       : { id, doctorId: user.id },
//   });

//   if (!existingAppointment) {
//     return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
//   }

//   await prisma.appointment.delete({ where: { id } });

//   return NextResponse.json({ message: "Appointment deleted successfully" }, { status: 200 });
// });
