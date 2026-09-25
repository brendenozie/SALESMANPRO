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
      contentType = "BLOG",
      contentId,
      companyId,
      phoneNumber,
      customerId,
      paymentMethod = "MPESA",
    } = body;

    if (!contentId || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields: contentId, companyId" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // 1. Resolve content details & price
    let title = "Media Content";
    let price = 0;
    let currency = "KES";

    const typeNormalized = contentType.toUpperCase();

    if (typeNormalized === "BLOG" || typeNormalized === "ARTICLE") {
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
    } else if (typeNormalized === "VIDEO") {
      const video = await prisma.video.findUnique({
        where: { id: contentId },
        include: { album: true },
      });
      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
      title = video.title || "Video";
      const parentBlog = await prisma.blog.findFirst({
        where: { videoAlbumId: video.albumId },
        select: { price: true, currency: true },
      });
      price = parentBlog?.price || 0;
      currency = parentBlog?.currency || "KES";
    } else if (typeNormalized === "ALBUM" || typeNormalized === "VIDEO_ALBUM") {
      const album = await prisma.videoAlbum.findUnique({
        where: { id: contentId },
      });
      if (!album) {
        return NextResponse.json({ error: "Video album not found" }, { status: 404 });
      }
      title = album.title;
      const parentBlog = await prisma.blog.findFirst({
        where: { videoAlbumId: album.id },
        select: { price: true, currency: true },
      });
      price = parentBlog?.price || 0;
      currency = parentBlog?.currency || "KES";
    } else if (typeNormalized === "PHOTO_ALBUM" || typeNormalized === "GALLERY") {
      const album = await prisma.photoAlbum.findUnique({
        where: { id: contentId },
      });
      if (!album) {
        return NextResponse.json({ error: "Photo album not found" }, { status: 404 });
      }
      title = album.title;
      const parentBlog = await prisma.blog.findFirst({
        where: { photoAlbumId: album.id },
        select: { price: true, currency: true },
      });
      price = parentBlog?.price || 0;
      currency = parentBlog?.currency || "KES";
    } else if (typeNormalized === "CONTENT") {
      const content = await prisma.content.findUnique({
        where: { id: contentId },
      });
      if (!content) {
        return NextResponse.json({ error: "Content not found" }, { status: 404 });
      }
      title = content.title;
    }

    // 2. Link or create consumer record if possible
    let linkedConsumerId = null;
    if (userId || customerId) {
      const consumer = await prisma.consumer.findFirst({
        where: {
          companyId,
          ...(userId ? { assignedAgent: userId } : {}),
        },
      });
      linkedConsumerId = consumer?.id || null;
    }

    // 3. Handle Payment Processing (M-Pesa / Card)
    let mpesaResult: any = null;
    let paymentStatus = "COMPLETED";

    if (paymentMethod === "MPESA" && phoneNumber && price > 0) {
      try {
        const paymentConfig = await getCompanyPaymentConfig(companyId);
        if (paymentConfig?.credentials && (paymentConfig.provider === "mpesa" || paymentConfig.provider === "ghuba")) {
          mpesaResult = await initiateMpesaPayment(
            {
              id: contentId,
              trackingNumber: `MEDIA-${Date.now().toString().slice(-6)}`,
              totalFinalPrice: price,
            },
            phoneNumber,
            paymentConfig.credentials as any
          );
        }
      } catch (mpesaErr: any) {
        console.warn("[ContentCheckout] M-Pesa push notice:", mpesaErr.message);
      }
    }

    // 4. Create ContentAccess Record
    const accessRecord = await prisma.contentAccess.create({
      data: {
        companyId,
        userId: userId || undefined,
        consumerId: linkedConsumerId || undefined,
        customerId: customerId || undefined,
        contentType: typeNormalized,
        contentId,
        amount: price,
        currency,
        paymentMethod,
        paymentStatus,
        orderId: `ORD-${Date.now()}`,
      },
    });

    // 5. Fire Telemetry Event
    tracker.track({
      eventType: "MEDIA_PURCHASE" as any,
      companyId,
      userId,
      customerId,
      metadata: {
        contentType: typeNormalized,
        contentId,
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
    return NextResponse.json(
      { error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
