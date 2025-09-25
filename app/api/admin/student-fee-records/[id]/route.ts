// app/api/admin/student-fee-records/[id]/route.ts
import { NextResponse } from 'next/server';
import { getStudentFeeRecordById, updateStudentFeeRecord, deleteStudentFeeRecord, StudentFeeRecord } from '@/lib/data';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

interface Context {
  params: { id: string };
}

// Handles GET requests for a single student fee record
export async function GET(request: Request, context: Context) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { id } = context.params;
    const record = await getStudentFeeRecordById(id);
    if (record) {
      return NextResponse.json(record);
    } else {
      return NextResponse.json({ error: 'Student fee record not found.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error fetching student fee record:', error);
    return NextResponse.json({ error: 'Failed to fetch student fee record', details: error.message }, { status: 500 });
  }
}

// Handles PUT requests for updating a student fee record (e.g., dueDate, invoiceNumber)
export async function PUT(request: Request, context: Context) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { id } = context.params;
    // Only allow specific fields to be updated directly
    const body: Partial<Pick<StudentFeeRecord, 'dueDate' | 'invoiceNumber'>> = await request.json();

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'No update data provided.' }, { status: 400 });
    }

    const updatedRecord = await updateStudentFeeRecord(id, body);
    if (updatedRecord) {
      return NextResponse.json(updatedRecord);
    } else {
      return NextResponse.json({ error: 'Student fee record not found or failed to update.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error updating student fee record:', error);
    return NextResponse.json({ error: 'Failed to update student fee record', details: error.message }, { status: 500 });
  }
}

// Handles DELETE requests for deleting a student fee record
export async function DELETE(request: Request, context: Context) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { id } = context.params;
    const success = await deleteStudentFeeRecord(id);
    if (success) {
      return new NextResponse(null, { status: 204 });
    } else {
      return NextResponse.json({ error: 'Student fee record not found or failed to delete.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error deleting student fee record:', error);
    return NextResponse.json({ error: 'Failed to delete student fee record', details: error.message }, { status: 500 });
  }
}
