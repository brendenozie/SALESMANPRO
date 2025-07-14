// app/api/admin/[adminSlug]/prescriptions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// IMPORTANT: This API assumes a 'Prescription' model exists in your schema.prisma
// If it doesn't, you'll need to add it or adjust logic to derive from other models.
// Example 'Prescription' model structure assumed for this API:
// model Prescription {
//   id           String    @id @default(auto()) @map("_id") @db.ObjectId
//   patientId    String    @db.ObjectId
//   patient      User      @relation(fields: [patientId], references: [id])
//   doctorId     String    @db.ObjectId
//   doctor       Educator  @relation(fields: [doctorId], references: [id]) // Assuming Educator is doctor
//   medication   String
//   dosage       String
//   instructions String?
//   issuedDate   DateTime
//   expiryDate   DateTime?
//   status       String    @default("Pending") // e.g., "Pending", "Dispensed", "Expired"
//   notes        String?
//   companyId    String    @db.ObjectId
//   company      Company   @relation(fields: [companyId], references: [id])
//   createdAt    DateTime? @default(now())
//   updatedAt    DateTime? @updatedAt
// }

export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const filterStatus = searchParams.get("status");
  const searchKeyword = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "issuedDate";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const validSortBy = ["issuedDate", "status", "patientName", "medication"]; // Add patientName, medication if possible via relations
  if (!validSortBy.includes(sortBy)) {
    return NextResponse.json({ message: "Invalid sortBy parameter" }, { status: 400 });
  }

  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortOrder)) {
    return NextResponse.json({ message: "Invalid sortOrder parameter" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    const whereClause: any = {
      companyId: company.id,
    };

    if (filterStatus && filterStatus !== 'All') {
      whereClause.status = filterStatus;
    }

    if (searchKeyword) {
      whereClause.OR = [
        { medication: { contains: searchKeyword, mode: 'insensitive' } },
        { patient: { name: { contains: searchKeyword, mode: 'insensitive' } } },
        { doctor: { name: { contains: searchKeyword, mode: 'insensitive' } } },
      ];
    }

    const [prescriptions, totalItems] = await prisma.$transaction([
      // Assuming 'prisma.prescription' exists
      prisma.prescription.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          medication: true,
          dosage: true,
          issuedDate: true,
          status: true,
          patient: { select: { name: true } },
          doctor: { select: { name: true } },
        },
      }),
      prisma.prescription.count({ where: whereClause }),
    ]);

    const formattedPrescriptions = prescriptions.map(rx => ({
      id: rx.id,
      patientName: rx.patient?.name || 'N/A',
      doctorName: rx.doctor?.name || 'N/A',
      medication: rx.medication,
      dosage: rx.dosage,
      issuedDate: new Date(rx.issuedDate).toISOString().split('T')[0],
      status: rx.status,
    }));

    return NextResponse.json({
      prescriptions: formattedPrescriptions,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const body = await request.json();

  const { patientId, doctorId, medication, dosage, instructions, issuedDate, expiryDate, status = "Pending" } = body;

  if (!patientId || !doctorId || !medication || !dosage || !issuedDate) {
    return NextResponse.json({ message: "Missing required fields: patientId, doctorId, medication, dosage, issuedDate" }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    // Verify patient and doctor exist and belong to the company
    const patient = await prisma.user.findUnique({ where: { id: patientId, Company: { some: { id: company.id } } }, select: { id: true } });
    const doctor = await prisma.educator.findUnique({ where: { id: doctorId, companyId: company.id }, select: { id: true } });

    if (!patient || !doctor) {
      return NextResponse.json({ message: "Patient or Doctor not found or not associated with this company" }, { status: 404 });
    }

    // Assuming 'prisma.prescription' exists
    const newPrescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        medication,
        dosage,
        instructions,
        issuedDate: new Date(issuedDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status,
        companyId: company.id,
      },
    });

    return NextResponse.json(
      { message: "Prescription created successfully", prescription: newPrescription },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}