// app/api/admin/student-fee-records/[id]/route.ts

import { getStudentFeeRecordById, updateStudentFeeRecord, deleteStudentFeeRecord, StudentFeeRecord } from '@/lib/data';
import { formatResponse } from "@/lib/formatResponse";

import { withApiHandler } from '@/lib/hooks/withApiHandler';

interface Context {
  params: { id: string };
}

// GET handler
async function getStudentFee(req: Request, context: Context) {

  try {
    const { id } = context.params;
    const record = await getStudentFeeRecordById(id);
    if (!record) {
      return formatResponse(false, null, 'Student fee record not found.', 404);
    }
    return formatResponse(true, record);
  } catch (error: any) {
    console.error('Error fetching student fee record:', error);
    return formatResponse(false, null, error.message || 'Failed to fetch student fee record', 500);
  }
}

// PUT handler
async function updateStudentFee(req: Request, context: Context) {

  try {
    const { id } = context.params;
    const body: Partial<Pick<StudentFeeRecord, 'dueDate' | 'invoiceNumber'>> = await req.json();

    if (Object.keys(body).length === 0) {
      return formatResponse(false, null, 'No update data provided.', 400);
    }

    const updatedRecord = await updateStudentFeeRecord(id, body);
    if (!updatedRecord) {
      return formatResponse(false, null, 'Student fee record not found or failed to update.', 404);
    }

    return formatResponse(true, updatedRecord, 'Student fee record updated successfully.');
  } catch (error: any) {
    console.error('Error updating student fee record:', error);
    return formatResponse(false, null, error.message || 'Failed to update student fee record', 500);
  }
}

// DELETE handler
async function deleteStudentFee(req: Request, context: Context) {
  
  try {
    const { id } = context.params;
    const success = await deleteStudentFeeRecord(id);
    if (!success) {
      return formatResponse(false, null, 'Student fee record not found or failed to delete.', 404);
    }
    return formatResponse(true, null, 'Student fee record deleted successfully.', 204);
  } catch (error: any) {
    console.error('Error deleting student fee record:', error);
    return formatResponse(false, null, error.message || 'Failed to delete student fee record', 500);
  }
}

// Export handlers wrapped with withApiHandler
export const GET = withApiHandler(getStudentFee);
export const PUT = withApiHandler(updateStudentFee);
export const DELETE = withApiHandler(deleteStudentFee);
