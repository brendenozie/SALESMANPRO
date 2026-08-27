import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    // ✅ Protect route
    // const admin = await verifyAdmin(req);
    // if (!admin) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    const { phone, reference } = await req.json();

    if (!phone || !reference) {
      return NextResponse.json(
        { message: "Phone and reference are required" },
        { status: 400 }
      );
    }

    // ✅ Find pending subscription payment
    const payment = await prisma.subscriptionPayment.findFirst({
      where: {
        // phone,
        gatewayRef: reference,
        status: "PENDING",
        gateway: "MPESA_TILL",
      },
      include: {
        subscription: {
          include: { company: true },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Pending Till subscription payment not found" },
        { status: 404 }
      );
    }

    const subscription = payment.subscription;

    // ✅ Calculate renewal safely
    const renewalDate = new Date(subscription.renewalDate || new Date());
    if (subscription.billingCycle === "ANNUALLY") {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    // ✅ Confirm everything
    await prisma.$transaction(async (tx) => {
      await tx.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          paidAt: new Date(),
        },
      });

      await tx.subscriptionCompany.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          gateway: "MPESA_TILL",
          renewalDate,
        },
      });

      await tx.company.update({
        where: { id: subscription.companyId },
        data: { hasWebsite: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Till subscription confirmed",
      subscriptionId: subscription.id,
      companyId: subscription.companyId,
    });
  } catch (err: any) {
    console.error("Till confirm error:", err);

    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}