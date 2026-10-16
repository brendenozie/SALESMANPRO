import crypto from "crypto";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/server/db/prismadb";
import { syncAuthoritativePayment } from "@/lib/payments/syncPayment";
import { PaymentMethodType, PaymentStatus, OrderChannel } from "@prisma/client";
import { getPlatformPaystackCredentials } from "@/lib/payments/resolver";
import { decryptSecret } from "@/lib/payments/decrypt";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      console.warn("❌ [PAYSTACK_WEBHOOK_REJECTED] Missing x-paystack-signature header");
      return new NextResponse("Missing signature", { status: 400 });
    }

    const paystackCreds = getPlatformPaystackCredentials();
    const platformSecret = paystackCreds.secretKey || process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET || "";

    let isVerified = false;

    if (platformSecret) {
      const computedPlatform = crypto
        .createHmac("sha512", platformSecret)
        .update(rawBody)
        .digest("hex");

      if (computedPlatform === signature) {
        isVerified = true;
      }
    }

    let event: any = null;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new NextResponse("Invalid JSON body", { status: 400 });
    }

    // Fallback: If not verified with platform secret, check merchant-specific secret
    if (!isVerified) {
      const ref = String(event?.data?.reference || "");
      const storeIdFromMeta = event?.data?.metadata?.storeId || event?.data?.metadata?.companyId;

      const order = ref
        ? await prisma.customerOrder.findFirst({
            where: {
              OR: [
                { trackingNumber: ref },
                { transactionReference: ref },
                ...(event?.data?.metadata?.orderId ? [{ id: event.data.metadata.orderId }] : []),
              ],
            },
            select: { companyId: true },
          })
        : null;

      const targetCompanyId = order?.companyId || storeIdFromMeta;

      if (targetCompanyId) {
        const companyWithSettings = await prisma.company.findUnique({
          where: { id: targetCompanyId },
          select: { PaymentSettings: true },
        });
        const storeSettings = companyWithSettings?.PaymentSettings;

        if (storeSettings?.isPaystackEnabled) {
          const merchantSecret = storeSettings.paystackSecret_encrypted
            ? decryptSecret(storeSettings.paystackSecret_encrypted, storeSettings.paystackSecret_iv, storeSettings.paystackSecret_tag)
            : storeSettings.paystackSecretKey;

          if (merchantSecret) {
            const computedMerchant = crypto
              .createHmac("sha512", merchantSecret)
              .update(rawBody)
              .digest("hex");

            if (computedMerchant === signature) {
              isVerified = true;
              console.log(`✅ [PAYSTACK_WEBHOOK] Verified using merchant-configured secret for store ${targetCompanyId}`);
            }
          }
        }
      }
    }

    if (!isVerified) {
      console.warn("❌ [PAYSTACK_WEBHOOK_REJECTED] Invalid signature for platform and merchant credentials");
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // Helper to guard MongoDB ObjectID format
    const isMongoId = (str?: string | null): boolean => Boolean(str && /^[0-9a-fA-F]{24}$/.test(str));

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
              ...(data.metadata?.transactionId && isMongoId(data.metadata.transactionId)
                ? [{ id: data.metadata.transactionId }]
                : []),
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
                type: "RENEWAL",
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
            ...(data.metadata?.orderId && isMongoId(data.metadata.orderId)
              ? [{ id: data.metadata.orderId }]
              : []),
          ],
        },
      });

      if (order) {
        const expected = Number(order.totalFinalPrice ?? order.totalPrice ?? 0);
        if (expected > 0 && amountInUnits < expected - 1) {
          await prisma.customerOrder.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.PENDING,
              notes: `${order.notes || ""} [Paystack Underpayment: Received KES ${amountInUnits}, Expected KES ${expected}]`.trim(),
            },
          });
          return NextResponse.json({ ok: false, error: "Underpayment detected" }, { status: 400 });
        }

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
