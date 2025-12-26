// app/api/admin/student-fee-records/route.ts

import { getStudentFeeRecords, createStudentFeeRecord, StudentFeeRecord } from '@/lib/data';
import { formatResponse } from "@/lib/formatResponse";
import prisma from '@/server/db/prismadb';
import { withApiHandler } from '@/lib/hooks/withApiHandler';

interface Context {
  params?: { id?: string };
}

// GET handler – fetch all student fee records
async function getAllStudentFees(req: Request, context: Context) {
  
  console.log('Fetching student fee records for company :', context);

  const companySlug = context.params?.id;

  const company = await prisma.company.findUnique({
    where: { slug: companySlug }
  });

  if (!company) {
    return formatResponse(false, null, 'Company not found.', 404);
  }


  try {
    const records = await getStudentFeeRecords(company.id);
    return formatResponse(true, records, 'Fetched student fee records successfully.');
  } catch (error: any) {
    console.error('Error fetching student fee records:', error);
    return formatResponse(false, null, error.message || 'Failed to fetch student fee records', 500);
  }
}
``
// POST handler – create a new student fee record
async function createStudentFee(req: Request) {
  
  try {
    const body: { studentId: string; academicYear: string; term: string } = await req.json();
    const { studentId, academicYear, term } = body;

    if (!studentId || !academicYear || !term) {
      return formatResponse(false, null, 'Missing required fields: studentId, academicYear, term.', 400);
    }

    const newRecord = await createStudentFeeRecord(studentId, academicYear, term);

    if (!newRecord) {
      return formatResponse(false, null, 'Failed to create student fee record. Student not found or other issue.', 404);
    }

    return formatResponse(true, newRecord, 'Student fee record created successfully.', 201);
  } catch (error: any) {
    console.error('Error creating student fee record:', error);

    // Handle unique constraint violation for (studentId, academicYear, term)
    if (error.code === 'P2002' && error.meta?.target?.includes('studentId_academicYear_term')) {
      return formatResponse(false, null, 'A fee record for this student, academic year, and term already exists.', 409);
    }

    return formatResponse(false, null, error.message || 'Failed to create student fee record', 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getAllStudentFees);
export const POST = withApiHandler(createStudentFee);
