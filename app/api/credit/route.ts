import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── GET /api/credit?companyId=&consumerId= ──────────────────────────────────
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  const consumerId = req.nextUrl.searchParams.get("consumerId");
  const phone = req.nextUrl.searchParams.get("phone");

  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  try {
    // Lookup single consumer account
    if (consumerId || phone) {
      let cid = consumerId;
      if (!cid && phone) {
        const consumer = await prisma.consumer.findFirst({
          where: { companyId, user: { phone } },
          select: { id: true },
        });
        cid = consumer?.id;
      }
      if (!cid) return NextResponse.json({ error: "Consumer not found" }, { status: 404 });

      const account = await prisma.customerCreditAccount.findUnique({
        where: { companyId_consumerId: { companyId, consumerId: cid } },
        include: {
          consumer: { include: { user: { select: { name: true, email: true, phone: true } } } },
          transactions: { orderBy: { createdAt: "desc" }, take: 30 },
        },
      });
      return NextResponse.json({ account });
    }

    // List all accounts for company
    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
    const limit = 25;
    const [accounts, total] = await Promise.all([
      prisma.customerCreditAccount.findMany({
        where: { companyId },
        include: {
          consumer: { include: { user: { select: { name: true, email: true, phone: true } } } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customerCreditAccount.count({ where: { companyId } }),
    ]);

    const totalOverdue = await prisma.customerCreditAccount.aggregate({
      where: { companyId, currentBalance: { lt: 0 } },
      _sum: { currentBalance: true },
    });

    return NextResponse.json({ accounts, total, page, totalOwed: Math.abs(totalOverdue._sum.currentBalance ?? 0) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── POST /api/credit ────────────────────────────────────────────────────────
// Create or update a credit account; record transactions (TOP_UP, REPAYMENT, PURCHASE)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, companyId, consumerId, amount, orderId, reference, description, creditLimit, paymentTermDays, notes } = body;

    if (!companyId || !consumerId) return NextResponse.json({ error: "companyId and consumerId required" }, { status: 400 });

    if (action === "OPEN_ACCOUNT" || action === "UPDATE_LIMIT") {
      const account = await prisma.customerCreditAccount.upsert({
        where: { companyId_consumerId: { companyId, consumerId } },
        update: { creditLimit: creditLimit ?? undefined, paymentTermDays: paymentTermDays ?? undefined, notes: notes ?? undefined },
        create: { companyId, consumerId, creditLimit: creditLimit ?? 0, paymentTermDays: paymentTermDays ?? 30, notes },
      });
      return NextResponse.json({ account });
    }

    // Financial transaction (PURCHASE, TOP_UP, REPAYMENT, ADJUSTMENT, REFUND)
    if (!action || !amount) return NextResponse.json({ error: "action and amount required" }, { status: 400 });

    const account = await prisma.customerCreditAccount.findUnique({
      where: { companyId_consumerId: { companyId, consumerId } },
    });
    if (!account) return NextResponse.json({ error: "No credit account found for this consumer" }, { status: 404 });

    const delta = action === "PURCHASE" ? -Math.abs(amount) : Math.abs(amount);
    const newBalance = account.currentBalance + delta;

    if (action === "PURCHASE") {
      const available = account.creditLimit + account.currentBalance; // currentBalance is negative = owed
      if (Math.abs(delta) > available + 0.001) {
        return NextResponse.json({ error: `Credit limit exceeded. Available: KES ${available.toFixed(2)}` }, { status: 400 });
      }
    }

    const [tx, updated] = await prisma.$transaction([
      prisma.creditTransaction.create({
        data: {
          companyId,
          accountId: account.id,
          consumerId,
          orderId: orderId ?? null,
          txType: action,
          amount: delta,
          balanceBefore: account.currentBalance,
          balanceAfter: newBalance,
          reference: reference ?? null,
          description: description ?? null,
          dueDate: action === "PURCHASE" && account.paymentTermDays
            ? new Date(Date.now() + account.paymentTermDays * 86_400_000)
            : null,
        },
      }),
      prisma.customerCreditAccount.update({
        where: { id: account.id },
        data: { currentBalance: newBalance, updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ transaction: tx, account: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
