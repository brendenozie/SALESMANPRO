

import { withApiHandler } from '@/lib/hooks/withApiHandler'; // New import
import { formatResponse } from '@/lib/formatResponse'; // New import
import { getFeeItemById, createFeeItem } from '@/lib/data'; // Adjust path as needed
import { verifyAuth } from '@/lib/verifyAuth';

// =======================================================================
// GET /api/admin/fees
// Handles GET requests for all fee records filtered by schoolId.
// =======================================================================
async function getFees(request: Request) {
  
  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get('schoolId');

  if (!schoolId) {
    return formatResponse(false, null, 'schoolId is required for fetching fee records.', 400);
  }

  // NOTE: Assuming getFeeRecords handles the actual data fetching logic.
  const records = getFeeItemById(schoolId);
  return formatResponse(true, records, null, 200);
}

// =======================================================================
// POST /api/admin/fees
// Handles POST requests for adding new fee records.
// =======================================================================
async function createFeeRecord(request: Request) {
  


  const body = await request.json();
  const { studentName, studentClass, term, academicYear, totalFeesDue, amountPaid, dueDate, schoolId } = body;

  // Basic validation
  if (!studentName || !studentClass || !term || !academicYear || totalFeesDue === undefined || amountPaid === undefined || !schoolId) {
    return formatResponse(false, null, 'Missing required fields for new fee record.', 400);
  }

  // NOTE: This logic assumes addFeeRecord is a mock or non-Prisma function.
  const newRecord = createFeeItem({
    name: studentName, // or another appropriate value
    description: null, // or provide a description if available
    defaultAmount: totalFeesDue ?? 0,
    applicableTo: studentClass, // or another appropriate value
    applicableValue: null, // or provide if available
    academicYear,
    term,
    isMandatory: true // or set based on your logic
  });

  return formatResponse(true, newRecord, null, 201);
}

// Export the refactored handlers wrapped in withApiHandler
export const GET = withApiHandler(getFees);
export const POST = withApiHandler(createFeeRecord);
