import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/loyalty/consumer?companyId=...&consumerId=...
// Returns a consumer's loyalty balance, tier, and recent transactions
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  const consumerId = req.nextUrl.searchParams.get("consumerId");
  const phone = req.nextUrl.searchParams.get("phone");

  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  try {
    let consumer;
    if (consumerId) {
      consumer = await prisma.consumer.findUnique({ where: { id: consumerId }, include: { user: { select: { name: true, email: true, phone: true } } } });
    } else if (phone) {
      // Look up by user phone
      consumer = await prisma.consumer.findFirst({
        where: { companyId, user: { phone } },
        include: { user: { select: { name: true, email: true, phone: true } } },
      });
    }

    if (!consumer) return NextResponse.json({ error: "Consumer not found" }, { status: 404 });

    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { companyId, consumerId: consumer.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const program = await prisma.loyaltyProgram.findUnique({ where: { companyId } });

    return NextResponse.json({
      consumer: {
        id: consumer.id,
        name: consumer.user?.name,
        email: consumer.user?.email,
        phone: consumer.user?.phone,
        loyaltyPoints: consumer.loyaltyPoints ?? 0,
        loyaltyTier: consumer.loyaltyTier ?? "BRONZE",
      },
      transactions,
      program,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
