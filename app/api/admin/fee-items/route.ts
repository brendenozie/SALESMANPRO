// app/api/admin/fee-items/route.ts
import { NextResponse } from 'next/server';
import { getFeeItems, createFeeItem, FeeItem } from '../../../../lib/data';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';

// Handles GET requests for all fee items
export async function GET() {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const feeItems = await getFeeItems();
    return NextResponse.json(feeItems);
  } catch (error: any) {
    console.error('Error fetching fee items:', error);
    return NextResponse.json({ error: 'Failed to fetch fee items', details: error.message }, { status: 500 });
  }
}

// Handles POST requests for creating a new fee item
export async function POST(request: Request) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const body: Omit<FeeItem, 'id'> = await request.json();
    const { name, description, defaultAmount, applicableTo, applicableValue, academicYear, term, isMandatory } = body;

    // Basic validation
    if (!name || defaultAmount === undefined || !applicableTo) {
      return NextResponse.json({ error: 'Missing required fee item fields.' }, { status: 400 });
    }

    const newFeeItem = await createFeeItem({
      name, description, defaultAmount, applicableTo, applicableValue, academicYear, term, isMandatory
    });
    return NextResponse.json(newFeeItem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating fee item:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return NextResponse.json({ error: 'Fee item with this name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create fee item', details: error.message }, { status: 500 });
  }
}
