

import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { getStudentFeeRecords, createStudentFeeRecord, StudentFeeRecord } from '@/lib/data'; // Adjust path as needed
import { verifyAuth } from '@/lib/verifyAuth';


import { PrismaClient } from '@prisma/client';
// Initialize Prisma Client (Note: In a typical setup, this should be a singleton import)
const prisma = new PrismaClient();

// =======================================================================
// GET /api/admin/fees
// Handles GET requests for all fee records
// =======================================================================
async function handleGetFeeRecords(request: Request) {
  // Authentication is handled by withApiHandler, but we check success here
  
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('schoolId');

  if (!schoolId) {
    return formatResponse(false, null, 'schoolId is required for fetching fee records.', 400);
  }

  const records = getStudentFeeRecords(schoolId);
  return formatResponse(true, records, null, 200);
}

// =======================================================================
// POST /api/admin/fees
// Handles POST requests for adding new fee records
// =======================================================================
// async function handlePostFeeRecordv1(request: Request) {
//   // Authentication is handled by withApiHandler, but we check success here
  

//   const body = await request.json();
//   const { studentName, studentClass, term, academicYear, totalFeesDue, amountPaid, dueDate, companyId } = body;

//   // Basic validation
//   if (!studentName || !studentClass || !term || !academicYear || totalFeesDue === undefined || amountPaid === undefined || !companyId) {
//     return formatResponse(false, null, 'Missing required fields for new fee record.', 400);
//   }

//   const studentId = `S${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`; // Generate a mock studentId
//   const newRecord = createStudentFeeRecord(studentId, academicYear, term);

//   return formatResponse(true, newRecord, null, 201);
// }

async function handlePostFeeRecord(request: Request) {
  const body = await request.json();

  const {
    studentId,
    studentIds,
    academicYear,
    term,
    dueDate,
    invoiceNumber,
    feeItemIds,
    schoolId,
  } = body;

  if (!academicYear || !term || !feeItemIds?.length || !schoolId) {
    return formatResponse(false, null, "Missing required fields", 400);
  }

  const targetStudentIds = studentIds?.length
    ? studentIds
    : studentId
    ? [studentId]
    : [];

  if (!targetStudentIds.length) {
    return formatResponse(false, null, "No students selected", 400);
  }

  // 1️⃣ Fetch fee items
  const feeItems = await prisma.feeItem.findMany({
    where: {
      id: { in: feeItemIds },
      companyId: schoolId,
    },
  });

  if (!feeItems.length) {
    return formatResponse(false, null, "Invalid fee items", 400);
  }

  const appliedFeeItems = feeItems.map(item => ({
    feeItemId: item.id,
    name: item.name,
    amount: item.defaultAmount,
    description: item.description,
    isMandatory: item.isMandatory,
  }));

  // 2️⃣ Prevent duplicates
  const existing = await prisma.studentFeeRecord.findMany({
    where: {
      studentId: { in: targetStudentIds },
      academicYear,
      term,
    },
    select: { studentId: true },
  });

  const existingSet = new Set(existing.map(r => r.studentId));
  const eligibleStudentIds = targetStudentIds.filter(
    (id: string) => !existingSet.has(id)
  );

  if (!eligibleStudentIds.length) {
    return formatResponse(
      false,
      null,
      "All selected students already have fee records for this period",
      409
    );
  }

  // 3️⃣ Create records
  await prisma.studentFeeRecord.createMany({
    data: eligibleStudentIds.map((studentId: any) => ({
      studentId,
      academicYear,
      term,
      dueDate,
      invoiceNumber,
      appliedFeeItems,
      paymentStatus: "Unpaid",
      amountPaid: 0,
    })),
  });

  return formatResponse(
    true,
    {
      created: eligibleStudentIds.length,
      skipped: targetStudentIds.length - eligibleStudentIds.length,
    },
    "Fee records created successfully",
    201
  );
}


// Export the refactored handlers wrapped in withApiHandler
export const GET = withApiHandler(handleGetFeeRecords);
export const POST = withApiHandler(handlePostFeeRecord);
