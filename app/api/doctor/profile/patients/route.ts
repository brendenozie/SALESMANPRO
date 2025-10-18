// app/api/doctor/patients/route.ts
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

/**
 * Handler to fetch unique patients associated with a doctor.
 * Supports optional search filtering.
 */
async function getDoctorPatients(request: Request) {
  // 1. Authentication Check
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  // 2. Extract Query Params
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!doctorId) {
    return formatResponse(false, null, "Missing required query parameter: doctorId.", 400);
  }

  try {
    // 3. Fetch distinct patients linked to this doctor
    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true,
            consumerProfile: { select: { id: true } },
          },
        },
      },
      distinct: ["userId"],
    });

    // 4. Map and normalize patients
    let patients = appointments.map((appt) => ({
      // consumerProfile is returned as an array, use the first element's id if present
      id: appt.user?.consumerProfile?.[0]?.id || appt.user?.id || "N/A",
      userId: appt.user?.id || "N/A",
      name: appt.user?.name || "N/A",
      email: appt.user?.email || "N/A",
      phone: appt.user?.phone || "N/A",
      profilePicture:
        appt.user?.profilePicture ||
        "https://placehold.co/100x100/A7F3D0/0D9488?text=PT",
    }));

    // 5. Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      patients = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(lowerSearch) ||
          patient.email.toLowerCase().includes(lowerSearch) ||
          patient.phone.toLowerCase().includes(lowerSearch)
      );
    }

    // 6. Success Response
    return formatResponse(true, patients, "Doctor patients fetched successfully.", 200);
  } catch (err: any) {
    console.error("GET /api/doctor/patients error:", err);
    return formatResponse(false, null, err.message || "Internal server error.", 500);
  }
}

// Export wrapped handler
export const GET = withApiHandler(getDoctorPatients);
