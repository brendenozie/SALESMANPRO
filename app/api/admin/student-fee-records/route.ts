// app/api/admin/student-fee-records/route.ts
import { NextResponse } from 'next/server';
import { getStudentFeeRecords, createStudentFeeRecord, StudentFeeRecord } from '../../../../lib/data';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';

// Handles GET requests for all student fee records
export async function GET() {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const records = await getStudentFeeRecords();
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error fetching student fee records:', error);
    return NextResponse.json({ error: 'Failed to fetch student fee records', details: error.message }, { status: 500 });
  }
}

// Handles POST requests for creating a new student fee record (by applying fee items)
export async function POST(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const body: { studentId: string; academicYear: string; term: string; } = await request.json();
    const { studentId, academicYear, term } = body;

    // Basic validation
    if (!studentId || !academicYear || !term) {
      return NextResponse.json({ error: 'Missing required fields: studentId, academicYear, term.' }, { status: 400 });
    }

    const newRecord = await createStudentFeeRecord(studentId, academicYear, term);
    if (newRecord) {
      return NextResponse.json(newRecord, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create student fee record. Student not found or other issue.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error creating student fee record:', error);
    // Handle unique constraint error (studentId, academicYear, term)
    if (error.code === 'P2002' && error.meta?.target?.includes('studentId_academicYear_term')) {
      return NextResponse.json({ error: 'A fee record for this student, academic year, and term already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create student fee record', details: error.message }, { status: 500 });
  }
}
