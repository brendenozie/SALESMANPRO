import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';
import { addPaymentToStudentFeeRecord } from '@/lib/data';
 import prisma from "@/server/db/prismadb";

interface Context {
  params: { id: string }; 
}

async function handlePostPayment(request: Request, context: Context) {
  const { id } = context.params;
  const body = await request.json();
  const { amount, date, method, receiptNumber } = body;

  if (!amount || amount <= 0 || !method) {
    return formatResponse(false, null, 'Valid amount and method required.', 400);
  }

  try {
    const updatedRecord = await addPaymentToStudentFeeRecord(id, {
      amount,
      date,
      method,
      receiptNumber,
    });

    if (!updatedRecord) throw new Error("Record not found");

    try {
      await cacheDel(`admin:fees:${id || 'global'}:*`);
    } catch (e) {}

    return formatResponse(true, updatedRecord, "Payment logged successfully", 200);
  } catch (error) {
    return formatResponse(false, null, 'Failed to log payment.', 500);
  }
}

export const POST = withApiHandler(handlePostPayment);