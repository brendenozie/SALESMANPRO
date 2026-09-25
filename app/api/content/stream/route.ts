import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AREGION || process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.ASECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucket = process.env.AS3_BUCKET_NAME || process.env.S3_BUCKET_NAME || "tulivuappsbucket";

/**
 * GET /api/content/stream?contentId=...&contentType=VIDEO|BLOG|ALBUM
 * Authoritative, access-controlled media delivery endpoint.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get("contentId");
    const contentType = (searchParams.get("contentType") || "VIDEO").toUpperCase();
    const customerId = searchParams.get("customerId");

    if (!contentId) {
      return NextResponse.json({ error: "Missing contentId parameter" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userRole = session?.user?.role;
    const userCompanyId = (session?.user as any)?.companyId;

    // 1. Resolve media details & underlying asset URL
    let mediaUrl: string | null = null;
    let isPremium = false;
    let companyId: string | null = null;

    if (contentType === "VIDEO") {
      const video = await prisma.video.findUnique({
        where: { id: contentId },
        include: { mediaAsset: true, album: true },
      });
      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
      mediaUrl = video.mediaAsset?.url || null;
      companyId = video.companyId;

      const parentBlog = await prisma.blog.findFirst({
        where: { videoAlbumId: video.albumId },
        select: { isPremium: true, price: true },
      });
      if (parentBlog && parentBlog.isPremium && (parentBlog.price || 0) > 0) {
        isPremium = true;
      }
    } else if (contentType === "BLOG" || contentType === "ARTICLE") {
      const blog = await prisma.blog.findUnique({
        where: { id: contentId },
        select: { isPremium: true, price: true, contentUrl: true, companyId: true, media: true },
      });
      if (!blog) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      mediaUrl = blog.contentUrl || null;
      companyId = blog.companyId;
      isPremium = Boolean(blog.isPremium && (blog.price || 0) > 0);
    } else if (contentType === "CONTENT") {
      const content = await prisma.content.findUnique({
        where: { id: contentId },
        include: {
          videoAlbum: { include: { videos: { include: { mediaAsset: true } } } },
        },
      });
      if (!content) {
        return NextResponse.json({ error: "Content not found" }, { status: 404 });
      }
      mediaUrl = content.contentUrl || content.videoAlbum?.videos?.[0]?.mediaAsset?.url || null;
      companyId = content.companyId;
    }

    if (!mediaUrl) {
      return NextResponse.json({ error: "No media stream associated with this content" }, { status: 404 });
    }

    // 2. Access verification
    if (isPremium) {
      let isAuthorized = false;

      // A. Tenant Admin / Staff bypass
      if (userId && companyId && userCompanyId === companyId) {
        if (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "STAFF" || userRole === "WRITER") {
          isAuthorized = true;
        }
      }

      // B. Entitlement check
      if (!isAuthorized) {
        const orConditions: any[] = [];
        if (userId) orConditions.push({ userId });
        if (customerId) orConditions.push({ customerId });

        if (orConditions.length > 0) {
          const accessRecord = await prisma.contentAccess.findFirst({
            where: {
              contentId,
              paymentStatus: "COMPLETED",
              OR: orConditions,
            },
          });
          if (accessRecord) {
            isAuthorized = true;
          }
        }
      }

      if (!isAuthorized) {
        return NextResponse.json(
          {
            error: "Forbidden: This is paid or private content. Access or purchase required.",
            isPremium: true,
          },
          { status: 403 }
        );
      }
    }

    // 3. Deliver secure streaming URL
    // If the media URL is an S3 object key or S3 URL, generate an expiring presigned GET URL (15 min TTL)
    let streamUrl = mediaUrl;
    if (mediaUrl.includes("amazonaws.com") || (!mediaUrl.startsWith("http") && !mediaUrl.startsWith("/"))) {
      try {
        let s3Key = mediaUrl;
        if (mediaUrl.includes("amazonaws.com/")) {
          s3Key = mediaUrl.split("amazonaws.com/")[1];
        }
        if (process.env.AACCESS_KEY_ID && process.env.ASECRET_ACCESS_KEY) {
          const getCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: s3Key,
          });
          streamUrl = await getSignedUrl(s3, getCommand, { expiresIn: 900 }); // 15 mins
        }
      } catch (s3Err: any) {
        console.warn("[MediaStream] Could not sign S3 URL, returning canonical URL:", s3Err.message);
      }
    }

    return NextResponse.json({
      success: true,
      streamUrl,
      expiresIn: 900,
      contentType,
      contentId,
    });
  } catch (error: any) {
    console.error("[MediaStream] Error serving stream:", error);
    return NextResponse.json({ error: error.message || "Failed to serve media stream" }, { status: 500 });
  }
}
