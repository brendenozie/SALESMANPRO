

import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { getFeeRecords, addFeeRecord, StudentFeeRecord } from '@/lib/data'; // Adjust path as needed
import { verifyAuth } from '@/lib/verifyAuth';

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

  const records = getFeeRecords(schoolId);
  return formatResponse(true, records, null, 200);
}

// =======================================================================
// POST /api/admin/fees
// Handles POST requests for adding new fee records
// =======================================================================
async function handlePostFeeRecord(request: Request) {
  // Authentication is handled by withApiHandler, but we check success here
  


  const body = await request.json();
  const { studentName, studentClass, term, academicYear, totalFeesDue, amountPaid, dueDate, schoolId } = body;

  // Basic validation
  if (!studentName || !studentClass || !term || !academicYear || totalFeesDue === undefined || amountPaid === undefined || !schoolId) {
    return formatResponse(false, null, 'Missing required fields for new fee record.', 400);
  }

  const newRecord = addFeeRecord({
    studentName,
    studentClass,
    term,
    academicYear,
    totalFeesDue,
    amountPaid,
    lastPaymentDate: null,
    dueDate,
    studentId: `S${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, // Generate a mock studentId
    schoolId // Pass schoolId to the mock DB function
  });

  return formatResponse(true, newRecord, null, 201);
}

// Export the refactored handlers wrapped in withApiHandler
export const GET = withApiHandler(handleGetFeeRecords);
export const POST = withApiHandler(handlePostFeeRecord);
