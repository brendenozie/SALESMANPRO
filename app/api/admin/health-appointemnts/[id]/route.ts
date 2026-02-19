import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
// Note: verifyAuth and NextResponse are no longer needed here, as they are managed by the middleware utilities.


async function authorizeAppointmentAccess(adminSlug: string, appointmentId: string) {
    // 1. Find Company by slug
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      // Use 403 Forbidden for authorization failure or 404 Not Found if you want to hide company existence
      return { success: false, data: null, error: "Company not found or access denied.", status: 403 };
    }

    // 2. Get all user IDs associated with this company
    const companyUserIds = (await prisma.user.findMany({
      where: { Company: { some: { id: company.id } } },
      select: { id: true }
    })).map(u => u.id);

    // 3. Check if the target appointment is associated with the company's users
    const appointmentCheck = await prisma.appointment.findUnique({
        where: { id: appointmentId, userId: { in: companyUserIds } },
        select: { id: true }
    });

    if (!appointmentCheck) {
        return { success: false, data: null, error: "Appointment not found or not associated with this company.", status: 404 };
    }

    return { success: true, data: { company, companyUserIds }, error: null, status: 200 };

}



async function getAppointment(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  // Perform Authorization Check (Business Logic)
  const authCheck = await authorizeAppointmentAccess(adminSlug, id);
  
  if (authCheck.success === false) return formatResponse(false, null, authCheck.error, authCheck.status); // Returns 403/404 error response

  // --- Data Fetching ---
  
    const cacheKey = `admin:health-appointemnts:${adminSlug || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const appointment = await prisma.appointment.findUnique({
    where: { id: id },
    select: {
      id: true,
      date: true,
      status: true,
      createdAt: true,
      // updatedAt: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      OrderItem: {
        select: {
          marketplaceListing: { select: { id: true, name: true, sellingPrice: true } }
        }
      }
    },
  });

  if (!appointment) {
      // Should ideally not happen due to the authCheck, but kept as a safeguard
      return formatResponse(false, null, "Appointment not found.", 404);
  }

  // --- Data Formatting ---
  const formattedAppointment = {
    ...appointment,
    patientName: appointment.user?.name || 'N/A',
    patientEmail: appointment.user?.email || 'N/A',
    patientPhone: appointment.user?.phone || 'N/A',
    doctorName: 'N/A', // Placeholder
    service: appointment.OrderItem[0]?.marketplaceListing?.name || 'N/A Service',
    serviceId: appointment.OrderItem[0]?.marketplaceListing?.id || null,
    servicePrice: appointment.OrderItem[0]?.marketplaceListing?.sellingPrice || 0,
    date: new Date(appointment.date).toISOString().split('T')[0],
    time: new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  

  try {
    if (appointment) {
      await cacheSet(cacheKey, formattedAppointment, 60);
    }
  } catch (e) {}

  // --- Success Response ---
  return formatResponse(true, formattedAppointment, "Appointment details fetched successfully", 200);
}



async function updateAppointment(request: Request, context: { params: { adminSlug: string; id: string } }) {
  const { params } = context;
  const { adminSlug, id } = params;
  const body = await request.json();
  const { date, time, status } = body; // Simplified body destructuring

  // Perform Authorization Check (Business Logic)
  const authCheck = await authorizeAppointmentAccess(adminSlug, id);
  if (authCheck.success === false) return formatResponse(false, null, authCheck.error, authCheck.status); // Returns 403/404 error response

  // --- Update Data Preparation ---
  let updateData: any = { updatedAt: new Date() };

  if (date && time) {
    // Combine date and time into a single Date object
    updateData.date = new Date(`${date}T${time}`);
  } else if (date) {
    updateData.date = new Date(date);
  }

  if (status) {
    updateData.status = status;
  }
  // Add other fields from 'body' to updateData as needed (e.g., notes)

  // --- Update Logic ---
  const updatedAppointment = await prisma.appointment.update({
    where: { id: id },
    data: updateData,
  });

  // --- Success Response ---
  
    try { await cacheDel(`admin:health-appointemnts:${adminSlug || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { message: "Appointment updated successfully", appointment: updatedAppointment }, "Appointment updated successfully", 200);
}



async function deleteAppointment(
  request: Request,
  { params }: { params: { adminSlug: string; id: string } }
) {
  const { adminSlug, id } = params;

  // Perform Authorization Check (Business Logic)
  const authCheck = await authorizeAppointmentAccess(adminSlug, id);
  if (authCheck.success === false) return formatResponse(false, null, authCheck.error, authCheck.status); // Returns 403/404 error response

  // --- Delete Logic ---
  // Delete associated OrderItems first if onDelete is not Cascade
  await prisma.orderItem.deleteMany({
    where: { appointmentId: id }
  });

  // Delete the appointment
  await prisma.appointment.delete({
    where: { id: id },
  });

  // --- Success Response ---
  // Use 200 OK or 204 No Content for successful deletion. Using 200 with a message.
  
    try { await cacheDel(`admin:health-appointemnts:${adminSlug || 'global'}:*`); } catch (e) {}
    
    return formatResponse(true, { message: "Appointment deleted successfully" }, "Appointment deleted successfully", 200);
}


// Wrap and export all handlers
export const GET = withApiHandler(getAppointment);
export const PUT = withApiHandler(updateAppointment);
export const DELETE = withApiHandler(deleteAppointment);
