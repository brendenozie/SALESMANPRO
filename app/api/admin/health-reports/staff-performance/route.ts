// app/api/admin/reports/staff-performance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(request: Request) {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const staffId = searchParams.get("staffId"); // Can be Doctor ID or StaffProfile ID
  const role = searchParams.get("role"); // 'DOCTOR', 'STAFF', 'ALL'

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    const dateFilter = {
      gte: startDateParam ? new Date(startDateParam) : undefined,
      lte: endDateParam ? new Date(endDateParam) : undefined,
    };

    let staffPerformanceData: any = [];

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
          if (appt.status === 'COMPLETED') { // Assuming 'COMPLETED' is a valid AppointmentStatus
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
          // Add other doctor-specific metrics if available (e.g., prescriptions issued)
        });
      });
    }

    // --- Non-Medical Staff Performance ---
    if (role === 'STAFF' || role === 'ALL') {
      const staffWhereClause: any = {
        companyId: companyId,
      };
      if (staffId) staffWhereClause.id = staffId;

      const staffProfiles = await prisma.staffProfile.findMany({
        where: staffWhereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
          // Add relations to other models if staff are directly involved in trackable actions
          // e.g., if staff process invoices, you might link to PatientInvoices
          // PatientInvoices: {
          //   where: {
          //     createdAt: dateFilter,
          //   },
          //   select: { amount: true }
          // }
        },
      });

      staffProfiles.forEach(staff => {
        // Example: If staff handle invoices
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
          // invoicesProcessed: invoicesProcessed, // Example metric
          // revenueProcessed: revenueProcessed,   // Example metric
          // Add other staff-specific metrics relevant to your operations
        });
      });
    }

    return NextResponse.json(staffPerformanceData);
  } catch (err: any) {
    console.error("GET /api/admin/reports/staff-performance error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
