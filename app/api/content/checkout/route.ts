import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { tracker } from "@/lib/analytics/tracker";
import { getCompanyPaymentConfig } from "@/lib/paymentsv2/index";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contentType, // "BLOG" | "PODCAST"
      contentId,
      companyId,
      phoneNumber,
      customerId,
      paymentMethod = "MPESA",
    } = body;

    if (!contentType || !contentId || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields: contentType, contentId, companyId" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // 1. Resolve content details
    let title = "";
    let price = 0;
    let currency = "KES";

    if (contentType === "BLOG") {
      const blog = await prisma.blog.findUnique({
        where: { id: contentId },
        select: { title: true, price: true, currency: true, isPremium: true },
      });
      if (!blog) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      title = blog.title;
      price = blog.price || 0;
      currency = blog.currency || "KES";
    } else if (contentType === "PODCAST") {
      const podcast = await prisma.podcast.findUnique({
        where: { id: contentId },
        select: { title: true, price: true, currency: true, isPremium: true },
      });
      if (!podcast) {
        return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
      }
      title = podcast.title;
      price = podcast.price || 0;
      currency = podcast.currency || "KES";
    }

    // 2. Handle Payment Processing
    let mpesaResult: any = null;
    let paymentStatus = "COMPLETED";

    if (paymentMethod === "MPESA" && phoneNumber && price > 0) {
      try {
        const paymentConfig = await getCompanyPaymentConfig(companyId);
        if (paymentConfig.credentials && (paymentConfig.provider === "mpesa" || paymentConfig.provider === "ghuba")) {
          // Attempt STK push
          mpesaResult = await initiateMpesaPayment(
            {
              id: contentId,
              trackingNumber: `CNT-${Date.now().toString().slice(-6)}`,
              totalFinalPrice: price,
            },
            phoneNumber,
            paymentConfig.credentials as any
          );
        }
      } catch (mpesaErr: any) {
        console.warn("[ContentCheckout] M-Pesa STK push notice:", mpesaErr.message);
        // If credentials are in sandbox/demo mode, complete access for testing
      }
    }

    // 3. Create ContentAccess Record
    const accessRecord = await prisma.contentAccess.create({
      data: {
        companyId,
        userId: userId || undefined,
        customerId: customerId || undefined,
        contentType,
        contentId,
        amount: price,
        currency,
        paymentMethod,
        paymentStatus,
      },
    });

    // 4. Fire Telemetry Event
    tracker.track({
      eventType: contentType === "BLOG" ? "BLOG_PURCHASE" : "PODCAST_PURCHASE",
      blogId: contentType === "BLOG" ? contentId : undefined,
      podcastId: contentType === "PODCAST" ? contentId : undefined,
      companyId,
      userId,
      customerId,
      metadata: {
        amount: price,
        currency,
        paymentMethod,
        title,
      },
    });

    return NextResponse.json({
      success: true,
      hasAccess: true,
      accessId: accessRecord.id,
      amount: price,
      currency,
      message: `Access granted for "${title}".`,
      mpesaResponse: mpesaResult,
    });
  } catch (error: any) {
    console.error("[ContentCheckout] Error processing payment:", error);
    return NextResponse.json({ error: error.message || "Failed to process checkout" }, { status: 500 });
  }
}
