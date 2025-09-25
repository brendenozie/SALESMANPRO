// app/api/admin/fee-items/[id]/route.ts
import { NextResponse } from 'next/server';
import { getFeeItemById, updateFeeItem, deleteFeeItem, FeeItem } from '@/lib/data';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

interface Context {
  params: { id: string };
}

// Handles GET requests for a single fee item
export async function GET(request: Request, context: Context) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = context.params;
    const feeItem = await getFeeItemById(id);
    if (feeItem) {
      return NextResponse.json(feeItem);
    } else {
      return NextResponse.json({ error: 'Fee item not found.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error fetching fee item:', error);
    return NextResponse.json({ error: 'Failed to fetch fee item', details: error.message }, { status: 500 });
  }
}

// Handles PUT requests for updating a fee item
export async function PUT(request: Request, context: Context) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = context.params;
    const updatedData: Partial<Omit<FeeItem, 'id'>> = await request.json();

    if (Object.keys(updatedData).length === 0) {
      return NextResponse.json({ error: 'No update data provided.' }, { status: 400 });
    }

    const updatedFeeItem = await updateFeeItem(id, updatedData);
    if (updatedFeeItem) {
      return NextResponse.json(updatedFeeItem);
    } else {
      return NextResponse.json({ error: 'Fee item not found or failed to update.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error updating fee item:', error);
    return NextResponse.json({ error: 'Failed to update fee item', details: error.message }, { status: 500 });
  }
}

// Handles DELETE requests for deleting a fee item
export async function DELETE(request: Request, context: Context) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { id } = context.params;
    const success = await deleteFeeItem(id);
    if (success) {
      return new NextResponse(null, { status: 204 });
    } else {
      return NextResponse.json({ error: 'Fee item not found or failed to delete.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error deleting fee item:', error);
    return NextResponse.json({ error: 'Failed to delete fee item', details: error.message }, { status: 500 });
  }
}
