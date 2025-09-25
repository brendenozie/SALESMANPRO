import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// PATCH (Update) an Inquiry's status
export async function PATCH(
  request: Request,
  { params }: { params: { inquiryId: string } }
) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const { inquiryId } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: 'Status is required in the request body.' }, { status: 400 });
    }

    const validStatuses = ['New', 'Read', 'Responded', 'Archived'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: {
        id: inquiryId,
      },
      data: {
        status: status,
      },
    });

    return NextResponse.json(updatedInquiry, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating inquiry status for ID ${params.inquiryId}:`, error);
    if (error.code === 'P2025') { // Prisma error for record not found
      return NextResponse.json({ message: 'Inquiry not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to update inquiry status', error: error.message },
      { status: 500 }
    );
  }
}