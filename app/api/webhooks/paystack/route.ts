import crypto from "crypto";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { PaymentMethodType, PaymentStatus, OrderChannel } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const secret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET || "";

    if (!secret) {
      console.error("❌ [PAYSTACK_WEBHOOK] PAYSTACK_SECRET_KEY missing on server");
      return new NextResponse("Webhook secret misconfigured", { status: 500 });
    }

    const computed = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const signature = req.headers.get("x-paystack-signature");

    if (computed !== signature) {
      console.warn("❌ [PAYSTACK_WEBHOOK_REJECTED] Invalid signature");
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const data = event.data;
      const reference = String(data.reference || "");
      const amountInUnits = Number(data.amount) / 100;
      const feeInUnits = data.fees ? Number(data.fees) / 100 : 0;
      const purpose = data.metadata?.purpose;

      // =========================================================================
      // 1. AI CREDIT TOP-UP RECONCILIATION
      // =========================================================================
      if (purpose === "AI_CREDIT_TOPUP" || reference.startsWith("AICRED-")) {
        const aiTx = await prisma.aICreditTransaction.findFirst({
          where: {
            OR: [
              { referenceId: reference },
              { idempotencyKey: reference },
              ...(data.metadata?.transactionId ? [{ id: data.metadata.transactionId }] : []),
            ],
          },
        });

        if (aiTx) {
          if (aiTx.status === "COMPLETED") {
            return NextResponse.json({ ok: true, message: "AI credits already allocated" });
          }

          const creditsToAdd = Number(data.metadata?.creditsToAdd || aiTx.amount);

          await prisma.$transaction(async (tx) => {
            const updated = await tx.company.update({
              where: { id: aiTx.companyId },
              data: {
                aiCreditBalance: { increment: creditsToAdd },
              },
              select: { aiCreditBalance: true },
            });

            await tx.aICreditTransaction.update({
              where: { id: aiTx.id },
              data: {
                status: "COMPLETED",
                balanceAfter: updated.aiCreditBalance,
                metadata: {
                  ...(aiTx.metadata as any || {}),
                  paystackId: data.id,
                  paystackReference: reference,
                  amountPaid: amountInUnits,
                  paidAt: data.paid_at || new Date().toISOString(),
                },
              },
            });

            await tx.whatsAppAIConfig.upsert({
              where: { companyId: aiTx.companyId },
              update: { enabled: true },
              create: { companyId: aiTx.companyId, enabled: true },
            });
          });

          console.log(`✅ [PAYSTACK_WEBHOOK] Allocated ${creditsToAdd} AI credits to company ${aiTx.companyId} via Paystack.`);
          return NextResponse.json({ ok: true, type: "AI_CREDIT_TOPUP" });
        }
      }

      // =========================================================================
      // 2. SUBSCRIPTION RECONCILIATION
      // =========================================================================
      if (purpose === "SUBSCRIPTION" || data.metadata?.planId) {
        const subId = data.metadata?.subscriptionId;
        const companyId = data.metadata?.companyId;

        const sub = subId
          ? await prisma.subscriptionCompany.findUnique({ where: { id: subId } })
          : await prisma.subscriptionCompany.findFirst({
              where: { companyId, status: "AWAITING_CONFIRMATION" },
            });

        if (sub) {
          const billingPeriod = data.metadata?.billingPeriod || sub.billingCycle || "MONTHLY";
          const renewalDate = new Date();
          if (billingPeriod === "ANNUALLY") {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
          } else {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
          }

          await prisma.$transaction(async (tx) => {
            await tx.subscriptionCompany.update({
              where: { id: sub.id },
              data: {
                status: "ACTIVE",
                gateway: "PAYSTACK",
                renewalDate,
              },
            });

            await tx.subscriptionPayment.create({
              data: {
                subscriptionId: sub.id,
                amount: amountInUnits,
                currency: data.currency || "KES",
                gateway: "PAYSTACK",
                gatewayRef: reference,
                status: "SUCCESS",
                paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
              },
            });

            await tx.company.update({
              where: { id: sub.companyId },
              data: { hasWebsite: true },
            });
          });

          console.log(`✅ [PAYSTACK_WEBHOOK] Subscription activated for company ${sub.companyId}.`);
          return NextResponse.json({ ok: true, type: "SUBSCRIPTION" });
        }
      }

      // =========================================================================
      // 3. CUSTOMER ORDER RECONCILIATION
      // =========================================================================
      const order = await prisma.customerOrder.findFirst({
        where: {
          OR: [
            { trackingNumber: reference },
            { transactionReference: reference },
            ...(data.metadata?.orderId ? [{ id: data.metadata.orderId }] : []),
          ],
        },
      });

      if (order) {
        await syncAuthoritativePayment({
          orderId: order.id,
          transactionId: String(data.id || reference),
          providerTransactionId: String(data.id),
          internalReference: reference,
          amount: amountInUnits,
          feeAmount: feeInUnits,
          currency: data.currency || "KES",
          provider: PaymentMethodType.PAYSTACK,
          channel: order.channel || OrderChannel.WEBSITE,
          status: PaymentStatus.COMPLETED,
          companyId: order.companyId,
          metadata: data,
          paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        });

        console.log(`✅ [PAYSTACK_WEBHOOK] Order ${order.trackingNumber || order.id} marked as PAID.`);
        return NextResponse.json({ ok: true, type: "ORDER" });
      }

      console.warn(`⚠️ [PAYSTACK_WEBHOOK] No match found for Paystack reference: ${reference}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    Sentry.captureException(err);
    console.error("[PAYSTACK_WEBHOOK_ERROR]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
