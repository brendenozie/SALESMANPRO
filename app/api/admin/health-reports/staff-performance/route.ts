import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { AppointmentStatus } from "@prisma/client"; // Assuming AppointmentStatus enum is available

/**
 * GET Handler: Generates a staff performance report for Doctors and/or general Staff.
 */
async function getStaffPerformanceReport(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const staffId = searchParams.get("staffId"); // Can be Doctor ID or StaffProfile ID
  const role = searchParams.get("role") || 'ALL'; // 'DOCTOR', 'STAFF', 'ALL'

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  const dateFilter = {
    gte: startDateParam ? new Date(startDateParam) : undefined,
    lte: endDateParam ? new Date(endDateParam) : undefined,
  };

  let staffPerformanceData: any[] = [];

  // --- Doctors Performance ---
  if (role === 'DOCTOR' || role === 'ALL') {
    const doctorWhereClause: any = {
      companyId: companyId,
    };
    if (staffId) doctorWhereClause.id = staffId;

    const doctors = await prisma.doctor.findMany({
      where: doctorWhereClause,
      include: {
        User: { select: { id: true, name: true, email: true } },
        Appointment: {
          where: {
            date: dateFilter,
          },
          include: {
            OrderItem: {
              select: {
                quantity: true,
                price: true,
              },
            },
          },
        },
      },
    });

    doctors.forEach(doctor => {
      let totalAppointments = 0;
      let totalRevenueGenerated = 0;
      let completedAppointments = 0;

      doctor.Appointment.forEach(appt => {
        totalAppointments++;
        if (appt.status === AppointmentStatus.COMPLETED) {
          completedAppointments++;
        }
        totalRevenueGenerated += appt.OrderItem.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      });

      staffPerformanceData.push({
        id: doctor.id,
        userId: doctor.userId,
        name: doctor.User?.name || 'Unknown Doctor',
        email: doctor.User?.email || 'N/A',
        type: 'Doctor',
        totalAppointments: totalAppointments,
        completedAppointments: completedAppointments,
        totalRevenueGenerated: totalRevenueGenerated,
        appointmentCompletionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
      });
    });
  }

  // --- Non-Medical Staff Performance (Placeholder for StaffProfile) ---
  if (role === 'STAFF' || role === 'ALL') {
    const staffWhereClause: any = {
      companyId: companyId,
    };
    if (staffId) staffWhereClause.id = staffId;

    // NOTE: This section remains largely functional based on your original structure,
    // but the metrics (invoicesProcessed/revenueProcessed) are commented out as they
    // rely on schema relationships (like StaffProfile -> PatientInvoice) not fully defined here.

    const staffProfiles = await prisma.staffProfile.findMany({
      where: staffWhereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        // If staff process orders/invoices, include that relation here:
        // PatientInvoices: { where: { createdAt: dateFilter } },
      },
    });

    staffProfiles.forEach(staff => {
      // Metric Placeholders (uncomment and calculate if relations are added)
      // const invoicesProcessed = staff.PatientInvoices?.length || 0;
      // const revenueProcessed = staff.PatientInvoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

      staffPerformanceData.push({
        id: staff.id,
        userId: staff.userId,
        name: staff.user?.name || 'Unknown Staff',
        email: staff.user?.email || 'N/A',
        type: 'Staff',
        jobTitle: staff.jobTitle,
        department: staff.department,
        // invoicesProcessed: invoicesProcessed,
        // revenueProcessed: revenueProcessed,
      });
    });
  }

  // 6. Return formatted success response
  return formatResponse(true, staffPerformanceData, "Staff performance report generated successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getStaffPerformanceReport);
