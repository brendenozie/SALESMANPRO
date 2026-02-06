import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const provider = searchParams.get("provider");
    const reference = searchParams.get("reference");      // Paystack
    const checkoutRequestId = searchParams.get("checkoutRequestId"); // STK
    const tillRef = searchParams.get("tillRef");          // ✅ Till reference

    if (!provider) {
      return fail("Missing provider");
    }

    let result: any;


    /* -------------------------------------------------------------------------- */
    /*                              MPESA TILL ✅                                  */
    /* -------------------------------------------------------------------------- */
     if (provider === "mpesa" && tillRef) {
      const payment = await prisma.payment.findFirst({
        where: {
          transactionId: tillRef,
          // method: "MPESA_TILL",
        },
      });

      if (!payment) return fail("Till payment not found");

      if (payment.status !== "COMPLETED") {
        return fail("Till payment pending admin confirmation");
      }

      const order = await prisma.customerOrder.findUnique({
        where: { id: payment.orderId! },
      });

      if (!order) return fail("Order missing");

      result = { tracking: order.trackingNumber };
    }

    /* -------------------------------------------------------------------------- */
    else {
      return fail("Unsupported provider");
    }

    const successUrl = new URL(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success`
    );
    successUrl.searchParams.set("trackingNumber", result.tracking);
    return NextResponse.redirect(successUrl);
  } catch (err: any) {
    console.error(err);
    return fail(err.message || "Verification error");
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function fail(message: string) {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/failed`
  );
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}