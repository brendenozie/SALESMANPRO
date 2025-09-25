// app/api/admin/patients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Assuming this path correctly points to your Prisma client initialization
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// Helper function to format patient data
async function formatPatientData(consumer: any) {
  const user = consumer.user;
  let lastVisitDate: string | null = null;

  // Fetch the latest appointment for the user
  if (user && user.id) {
    const latestAppointment = await prisma.appointment.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
    if (latestAppointment && latestAppointment.date) {
      lastVisitDate = new Date(latestAppointment.date).toLocaleDateString();
    }
  }

  // Note: dob and gender are assumed to be directly on the User model for simplicity.
  // If not, you'd need to extend your User schema or store them elsewhere (e.g., on Consumer model, or a dedicated PatientProfile).
  return {
    id: consumer.id, // Consumer's ID
    name: user?.name || 'N/A',
    email: user?.email || 'N/A',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${user?.name ? user.name.charAt(0) : '?'}${user?.name ? user.name.charAt(1) : ''}`,
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : 'N/A', // Assuming dob is a Date in User
    gender: user?.gender || 'Other', // Assuming gender is a string in User
    lastVisit: lastVisitDate || 'N/A',
    createdAt: consumer.createdAt ? new Date(consumer.createdAt).toLocaleDateString() : 'N/A',
  };
}

export async function GET(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const searchTerm = searchParams.get("searchTerm") || "";

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    let consumers = await prisma.consumer.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true,
            // Assuming dob and gender are on the User model.
            // If not, you'd need to add them to your schema or handle differently.
            dateOfBirth: true,
            gender: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // Order by creation date
    });

    // Client-side filtering if searchTerm is provided, as Prisma doesn't support
    // filtering on included relation fields directly in a simple `where` clause for `OR` conditions easily.
    // For large datasets, consider full-text search solutions or more complex Prisma queries.
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      consumers = consumers.filter(c =>
        c.user?.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        c.user?.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        c.user?.phone?.toLowerCase().includes(lowerCaseSearchTerm) ||
        c.user?.dateOfBirth?.toISOString().toLowerCase().includes(lowerCaseSearchTerm) // If dob is Date
      );
    }

    const enrichedPatients = await Promise.all(
      consumers.map(async (consumer) => formatPatientData(consumer))
    );

    return NextResponse.json(enrichedPatients);
  } catch (err: any) {
    console.error("GET /api/admin/patients error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const body = await request.json();
  const { name, email, phone, dob, gender, profilePicture, companyId } = body;

  if (!companyId || !email || !name) {
    return NextResponse.json(
      { error: "companyId, name, and email are required" },
      { status: 400 }
    );
  }

  try {
    // 1) Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        profilePicture,
        role: "CONSUMER", // Assign the CONSUMER role as per your schema
        // Assuming dob and gender can be directly set on User
        dateOfBirth: dob ? new Date(dob) : null,
        gender: gender || null,
      },
    });

    // 2) Create Consumer profile linked to the new User
    const consumer = await prisma.consumer.create({
      data: {
        companyId,
        userId: user.id,
        // Add any other default consumer-specific fields if necessary
      },
      include: {
        user: true, // Include user to format response
      },
    });

    const newPatient = await formatPatientData(consumer);

    return NextResponse.json(newPatient, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/admin/patients error:", err);
    // Handle unique constraint violation for email
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

