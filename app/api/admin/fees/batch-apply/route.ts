

import { formatResponse } from '@/lib/formatResponse';
import { getStudentsByTarget, batchApplySpecificFees } from '@/lib/data';

export async function POST(request: Request) {
  const body = await request.json();
  const { 
    feeItemIds,     // Array of IDs from the checkboxes
    targetType,     // "ALL" | "ACADEMIC_LEVEL" | "CLASS"
    targetValue,    // The ID of the Class or Level
    academicYear, 
    term, 
    schoolId 
  } = body;

  // 1. Resolve which students are affected
  const students = await getStudentsByTarget(schoolId, targetType, targetValue, academicYear, term);

  if (!students.length) {
    return formatResponse(false, null, 'No students found for this selection.', 404);
  }

  // 2. Apply the specific fees to those students
  const studentIds = students.map(s => s.id);
  const report = await batchApplySpecificFees({
    schoolId,
    studentIds,
    feeItemIds,
    academicYear,
    term
  });

  return formatResponse(true, report, "Batch processing complete.", 201);
}


// import { withApiHandler } from '@/lib/hooks/withApiHandler';
// import { formatResponse } from '@/lib/formatResponse';
// import { 
//   getStudentsByTarget, // New Helper: Filter by Class or Level
//   batchApplyFeesToStudents 
// } from '@/lib/data';

/**
 * POST /api/admin/fees/batch
 * Logic: 
 * 1. Identify target students (All, specific Level, or specific Class)
 * 2. Identify selected Fee Item templates
 * 3. Generate Fee Records (Invoices) for the specific Term/Year
 */
// async function handleBatchFeeGeneration(request: Request) {
//   const body = await request.json();
//   const { 
//     feeItemIds, 
//     targetType, 
//     targetValue, 
//     academicYear, 
//     term, 
//     schoolId 
//   } = body;

//   if (!feeItemIds?.length || !targetType || !schoolId) {
//     return formatResponse(false, null, 'Incomplete batch parameters.', 400);
//   }

//   // 1. Fetch the relevant student IDs based on the modal selection
//   const students = await getStudentsByTarget(schoolId, targetType, targetValue);

//   if (!students.length) {
//     return formatResponse(false, null, 'No students found for the selected criteria.', 404);
//   }

//   // 2. Execute the batch creation logic
//   // This helper should handle creating the StudentFeeRecord AND the linked StudentFeeItems
//   const result = await batchApplyFeesToStudents({
//     studentIds: students.map(s => s.id),
//     feeItemIds,
//     academicYear,
//     term,
//     schoolId
//   });

//   return formatResponse(true, { processed: students.length }, 'Fees applied successfully.', 201);
// }

// export const POST = withApiHandler(handleBatchFeeGeneration);