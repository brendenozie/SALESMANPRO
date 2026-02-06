import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
// import { verifyAdmin } from "@/server/auth/verifyAdmin";

export async function POST(req: Request) {
  try {
    // ✅ Protect route
    // const admin = await verifyAdmin(req);
    // if (!admin) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();
    const { phone, reference } = body;

    if (!phone || !reference) {
      return NextResponse.json(
        { message: "Phone and reference are required" },
        { status: 400 }
      );
    }

    // ✅ Find pending Till payment
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: reference,
        // phone,
        status: "PENDING",
        // method: "MPESA_TILL",
      },
      include: {
        order: true,
        user: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Pending Till payment not found" },
        { status: 404 }
      );
    }

    // ✅ Complete payment
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          transactionId: reference,
        },
      });

      await tx.customerOrder.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "COMPLETED",
          paymentMethod: "MPESA_TILL",
          transactionId: reference,
          transactionReference: reference,
          status: "COMPLETED",
          deliveryStatus: "Payment Verified",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Till payment confirmed",
      paymentId: payment.id,
      orderId: payment.orderId,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}