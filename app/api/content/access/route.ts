import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get("contentType"); // "BLOG" | "PODCAST"
    const contentId = searchParams.get("contentId");
    const customerId = searchParams.get("customerId");

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "Missing contentType or contentId" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // 1. Check if the content item is actually premium
    let isPremium = false;
    let price = 0;
    let currency = "KES";

    if (contentType === "BLOG") {
      const blog = await prisma.blog.findUnique({
        where: { id: contentId },
        select: { isPremium: true, price: true, currency: true },
      });
      if (!blog) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      isPremium = Boolean(blog.isPremium);
      price = blog.price || 0;
      currency = blog.currency || "KES";
    } else if (contentType === "PODCAST") {
      const podcast = await prisma.podcast.findUnique({
        where: { id: contentId },
        select: { isPremium: true, price: true, currency: true },
      });
      if (!podcast) {
        return NextResponse.json({ error: "Episode not found" }, { status: 404 });
      }
      isPremium = Boolean(podcast.isPremium);
      price = podcast.price || 0;
      currency = podcast.currency || "KES";
    }

    // If free, access is automatically granted
    if (!isPremium || price <= 0) {
      return NextResponse.json({
        hasAccess: true,
        isPremium: false,
        price: 0,
        currency,
      });
    }

    // 2. Check ContentAccess records
    const orConditions: any[] = [];
    if (userId) orConditions.push({ userId });
    if (customerId) orConditions.push({ customerId });

    if (orConditions.length === 0) {
      return NextResponse.json({
        hasAccess: false,
        isPremium: true,
        price,
        currency,
      });
    }

    const accessRecord = await prisma.contentAccess.findFirst({
      where: {
        contentType,
        contentId,
        paymentStatus: "COMPLETED",
        OR: orConditions,
      },
    });

    return NextResponse.json({
      hasAccess: Boolean(accessRecord),
      isPremium: true,
      price,
      currency,
      purchasedAt: accessRecord?.createdAt || null,
    });
  } catch (error: any) {
    console.error("[ContentAccess] Error verifying access:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
