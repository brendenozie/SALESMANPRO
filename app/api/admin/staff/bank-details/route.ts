import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(request: Request) {
  try {
    const { staffId, bankAccount, bankCode, bankName } = await request.json();

    // Basic Validation: Ensure account numbers are numeric and of standard length
    if (!/^\d{8,12}$/.test(bankAccount)) {
      return NextResponse.json({ error: "Invalid Account Number format" }, { status: 400 });
    }

    const updated = await prisma.staffProfile.update({
      where: { id: staffId },
      data: { 
        bankAccount, 
        bankCode,
        // Using notes or a json field if bankName isn't in your core schema
      },
    });

    
    try {
      await cacheDel(`tenant:${staffId}:bank-details:*`);
      await cacheDel(`admin:bank-details:*`);
    } catch (e) {}
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save bank details" }, { status: 500 });
  }
}