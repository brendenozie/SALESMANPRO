
// app/api/doctor/patients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!doctorId) {
    return NextResponse.json({ error: "Missing doctorId" }, { status: 400 });
  }

  try {
    // Find all appointments associated with this doctor
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
      },
      select: {
        userId: true, // Get patient's userId
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true,
            consumerProfile: { select: { id: true } } // Assuming consumerProfile is the patient profile
          }
        },
      },
      distinct: ['userId'], // Get unique patients
    });

    let patients = appointments.map(appt => ({
      id: "appt.user?.consumerProfile?.id || appt.user?.id || 'N/A'", // Prioritize consumerProfile ID, fallback to User ID
      userId: appt.user?.id || 'N/A',
      name: appt.user?.name || 'N/A',
      email: appt.user?.email || 'N/A',
      phone: appt.user?.phone || 'N/A',
      profilePicture: appt.user?.profilePicture || 'https://placehold.co/100x100/A7F3D0/0D9488?text=PT',
    }));

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      patients = patients.filter(patient =>
        patient.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        patient.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        patient.phone.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return NextResponse.json(patients);
  } catch (err: any) {
    console.error("GET /api/doctor/patients error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
