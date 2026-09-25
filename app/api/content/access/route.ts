import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentType = (searchParams.get("contentType") || "BLOG").toUpperCase();
    const contentId = searchParams.get("contentId");
    const customerId = searchParams.get("customerId");

    if (!contentId) {
      return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userRole = session?.user?.role;
    const userCompanyId = (session?.user as any)?.companyId;

    // 1. Resolve content details & price
    let isPremium = false;
    let price = 0;
    let currency = "KES";
    let companyId: string | null = null;
    let title = "";

    if (contentType === "BLOG" || contentType === "ARTICLE") {
      const blog = await prisma.blog.findUnique({
        where: { id: contentId },
        select: { title: true, isPremium: true, price: true, currency: true, companyId: true },
      });
      if (blog) {
        title = blog.title;
        isPremium = Boolean(blog.isPremium);
        price = blog.price || 0;
        currency = blog.currency || "KES";
        companyId = blog.companyId;
      }
    } else if (contentType === "VIDEO") {
      const video = await prisma.video.findUnique({
        where: { id: contentId },
        include: { mediaAsset: true, album: true },
      });
      if (video) {
        title = video.title || "Video";
        companyId = video.companyId;
        // Check if attached to a premium blog or album
        const parentBlog = await prisma.blog.findFirst({
          where: { videoAlbumId: video.albumId },
          select: { isPremium: true, price: true, currency: true },
        });
        if (parentBlog) {
          isPremium = Boolean(parentBlog.isPremium);
          price = parentBlog.price || 0;
          currency = parentBlog.currency || "KES";
        }
      }
    } else if (contentType === "ALBUM" || contentType === "VIDEO_ALBUM") {
      const album = await prisma.videoAlbum.findUnique({
        where: { id: contentId },
      });
      if (album) {
        title = album.title;
        companyId = album.companyId;
        const parentBlog = await prisma.blog.findFirst({
          where: { videoAlbumId: album.id },
          select: { isPremium: true, price: true, currency: true },
        });
        if (parentBlog) {
          isPremium = Boolean(parentBlog.isPremium);
          price = parentBlog.price || 0;
          currency = parentBlog.currency || "KES";
        }
      }
    } else if (contentType === "PHOTO_ALBUM" || contentType === "GALLERY") {
      const photoAlbum = await prisma.photoAlbum.findUnique({
        where: { id: contentId },
      });
      if (photoAlbum) {
        title = photoAlbum.title;
        companyId = photoAlbum.companyId;
        const parentBlog = await prisma.blog.findFirst({
          where: { photoAlbumId: photoAlbum.id },
          select: { isPremium: true, price: true, currency: true },
        });
        if (parentBlog) {
          isPremium = Boolean(parentBlog.isPremium);
          price = parentBlog.price || 0;
          currency = parentBlog.currency || "KES";
        }
      }
    } else if (contentType === "CONTENT") {
      const content = await prisma.content.findUnique({
        where: { id: contentId },
      });
      if (content) {
        title = content.title;
        companyId = content.companyId;
      }
    }

    // 2. Admin & Staff Bypass for their own company's content
    if (userId && companyId && userCompanyId === companyId) {
      if (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "STAFF" || userRole === "WRITER") {
        return NextResponse.json({
          hasAccess: true,
          isPremium,
          price,
          currency,
          isAdminBypass: true,
          title,
        });
      }
    }

    // 3. If content is free, access is automatically granted
    if (!isPremium || price <= 0) {
      return NextResponse.json({
        hasAccess: true,
        isPremium: false,
        price: 0,
        currency,
        title,
      });
    }

    // 4. Check ContentAccess records
    const orConditions: any[] = [];
    if (userId) orConditions.push({ userId });
    if (customerId) orConditions.push({ customerId });

    if (orConditions.length === 0) {
      return NextResponse.json({
        hasAccess: false,
        isPremium: true,
        price,
        currency,
        title,
        requiresLogin: true,
      });
    }

    // Look for exact match or generic contentType match for this content
    const accessRecord = await prisma.contentAccess.findFirst({
      where: {
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
      title,
      purchasedAt: accessRecord?.createdAt || null,
      accessId: accessRecord?.id || null,
    });
  } catch (error: any) {
    console.error("[ContentAccess] Error verifying access:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
