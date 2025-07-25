// app/api/admin/fees/route.ts
import { NextResponse } from 'next/server';
import { getFeeRecords, addFeeRecord, StudentFeeRecord } from '@/lib/data'; // Adjust path as needed

// Handles GET requests for all fee records
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId is required for fetching fee records.' }, { status: 400 });
    }

    const records = getFeeRecords(schoolId);
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error fetching fee records:', error);
    return NextResponse.json({ error: 'Failed to fetch fee records', details: error.message }, { status: 500 });
  }
}

// Handles POST requests for adding new fee records
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentName, studentClass, term, academicYear, totalFeesDue, amountPaid, dueDate, schoolId } = body;

    // Basic validation
    if (!studentName || !studentClass || !term || !academicYear || totalFeesDue === undefined || amountPaid === undefined || !schoolId) {
      return NextResponse.json({ error: 'Missing required fields for new fee record.' }, { status: 400 });
    }

    const newRecord = addFeeRecord({
      studentName,
      studentClass,
      term,
      academicYear,
      totalFeesDue,
      amountPaid,
      lastPaymentDate:null,
      dueDate,
      studentId: `S${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, // Generate a mock studentId
      schoolId // Pass schoolId to the mock DB function
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error('Error adding fee record:', error);
    return NextResponse.json({ error: 'Failed to add fee record', details: error.message }, { status: 500 });
  }
}

// You can also define other HTTP methods if needed, e.g., OPTIONS
// export async function OPTIONS(request: Request) { ... }
