import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

// ─── GET /api/loyalty?companyId=... ─────────────────────────────────────────
// Returns the loyalty programme config + aggregate stats
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  try {
    const program = await prisma.loyaltyProgram.findUnique({ where: { companyId } });
    const [totalMembers, totalPointsIssued, totalRedeemed] = await Promise.all([
      prisma.loyaltyTransaction.groupBy({
        by: ["consumerId"],
        where: { companyId },
        _count: true,
      }).then((r) => r.length),
      prisma.loyaltyTransaction.aggregate({
        where: { companyId, txType: "EARN" },
        _sum: { points: true },
      }).then((r) => r._sum.points ?? 0),
      prisma.loyaltyTransaction.aggregate({
        where: { companyId, txType: "REDEEM" },
        _sum: { points: true },
      }).then((r) => Math.abs(r._sum.points ?? 0)),
    ]);

    return NextResponse.json({ program, stats: { totalMembers, totalPointsIssued, totalRedeemed } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── PUT /api/loyalty ────────────────────────────────────────────────────────
// Create or update the loyalty programme config for a company
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, ...data } = body;
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    const program = await prisma.loyaltyProgram.upsert({
      where: { companyId },
      update: data,
      create: { companyId, ...data },
    });
    return NextResponse.json({ program });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── POST /api/loyalty ───────────────────────────────────────────────────────
// Earn or redeem points on an order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, consumerId, orderId, action, points: rawPoints, orderTotal, amount } = body;
    if (!companyId || !consumerId) {
      return NextResponse.json({ error: "companyId and consumerId required" }, { status: 400 });
    }

    const effectiveTotal = Number(orderTotal ?? amount ?? 0);

    const program = await prisma.loyaltyProgram.findUnique({ where: { companyId } });
    if (!program || !program.isActive) {
      return NextResponse.json({ error: "Loyalty programme not active" }, { status: 404 });
    }

    let consumer = await prisma.consumer.findUnique({ where: { id: consumerId } });
    if (!consumer) {
      consumer = await prisma.consumer.findFirst({
        where: { companyId, userId: consumerId },
      });
    }
    if (!consumer) return NextResponse.json({ error: "Consumer not found" }, { status: 404 });

    const currentBalance = consumer.loyaltyPoints ?? 0;

    if (action === "EARN") {
      const earned = Math.floor(effectiveTotal * program.pointsPerKes);
      const newBalance = currentBalance + earned;
      const tier = computeTier(newBalance, program);

      const [tx] = await prisma.$transaction([
        prisma.loyaltyTransaction.create({
          data: {
            companyId,
            programId: program.id,
            consumerId: consumer.id,
            orderId: orderId ?? null,
            txType: "EARN",
            points: earned,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: `Earned from order`,
            expiresAt: program.expiryDays
              ? new Date(Date.now() + program.expiryDays * 86_400_000)
              : null,
          },
        }),
        prisma.consumer.update({
          where: { id: consumer.id },
          data: { loyaltyPoints: newBalance, loyaltyTier: tier },
        }),
      ]);

      return NextResponse.json({ transaction: tx, newBalance, earned, tier });
    }

    if (action === "REDEEM") {
      const redeemPoints = Number(rawPoints);
      if (redeemPoints < program.minRedeemPoints) {
        return NextResponse.json({ error: `Minimum redemption is ${program.minRedeemPoints} points` }, { status: 400 });
      }
      if (redeemPoints > currentBalance) {
        return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
      }
      const redemptionValue = redeemPoints * program.kesPerPoint;
      if (effectiveTotal) {
        const maxAllowed = effectiveTotal * program.maxRedeemPct;
        if (redemptionValue > maxAllowed) {
          return NextResponse.json({
            error: `Redemption cannot exceed ${Math.round(program.maxRedeemPct * 100)}% of order (KES ${maxAllowed.toFixed(2)})`,
          }, { status: 400 });
        }
      }

      const newBalance = currentBalance - redeemPoints;
      const tier = computeTier(newBalance, program);

      const [tx] = await prisma.$transaction([
        prisma.loyaltyTransaction.create({
          data: {
            companyId,
            programId: program.id,
            consumerId: consumer.id,
            orderId: orderId ?? null,
            txType: "REDEEM",
            points: -redeemPoints,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: `Redeemed for KES ${redemptionValue.toFixed(2)}`,
          },
        }),
        prisma.consumer.update({
          where: { id: consumer.id },
          data: { loyaltyPoints: newBalance, loyaltyTier: tier },
        }),
      ]);

      return NextResponse.json({ transaction: tx, newBalance, redemptionValue, tier });
    }

    return NextResponse.json({ error: "Invalid action. Use EARN or REDEEM." }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function computeTier(points: number, program: any): string {
  if (points >= program.tierPlatinumMin) return "PLATINUM";
  if (points >= program.tierGoldMin) return "GOLD";
  if (points >= program.tierSilverMin) return "SILVER";
  return "BRONZE";
}
