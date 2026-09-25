/**
 * app/api/site/[slug]/me/content/route.ts
 *
 * User Content Hub API for the Blog & Podcast Profile:
 * - Subscribed Content (unlocked via ContentAccess)
 * - Liked Content (BLOG_LIKE, PODCAST_LIKE)
 * - Shared Content (BLOG_SHARE, PODCAST_SHARE)
 * - Bookmarked / Reading List Content (BLOG_BOOKMARK, PODCAST_BOOKMARK)
 * - High-level interaction engagement metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { resolveBlogMedia, resolvePodcastMedia } from "@/lib/media/content-media-resolver";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const email = session.user.email || "";

    const { slug } = await params;

    // Resolve company from slug
    const company = await prisma.company.findFirst({
      where: {
        OR: [{ slug }, { id: slug.length === 24 ? slug : undefined }],
      },
      select: { id: true, name: true, slug: true },
    });

    const companyId = company?.id;

    // 1. Fetch Subscribed Content (ContentAccess)
    const accessRecords = await prisma.contentAccess.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }, { consumerId: userId }] : []),
          ...(email ? [{ customerId: email }] : []),
        ],
        paymentStatus: "COMPLETED",
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const blogAccessIds = accessRecords
      .filter((a) => a.contentType === "BLOG")
      .map((a) => a.contentId);
    const podcastAccessIds = accessRecords
      .filter((a) => a.contentType === "PODCAST")
      .map((a) => a.contentId);
    const videoAccessIds = accessRecords
      .filter((a) => a.contentType === "VIDEO")
      .map((a) => a.contentId);
    const albumAccessIds = accessRecords
      .filter((a) => a.contentType === "ALBUM")
      .map((a) => a.contentId);
    const photoAlbumAccessIds = accessRecords
      .filter((a) => a.contentType === "PHOTO_ALBUM")
      .map((a) => a.contentId);
    const contentAccessIds = accessRecords
      .filter((a) => a.contentType === "CONTENT")
      .map((a) => a.contentId);

    // 2. Fetch Interaction Events (Liked, Shared, Bookmarked, Read)
    const userEvents = await prisma.productInteractionEvent.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }, { consumerId: userId }] : []),
          ...(email ? [{ customerId: email }] : []),
        ],
        eventType: {
          in: [
            "BLOG_LIKE",
            "BLOG_SHARE",
            "BLOG_BOOKMARK",
            "BLOG_READ",
            "PODCAST_LIKE",
            "PODCAST_SHARE",
            "PODCAST_BOOKMARK",
            "PODCAST_PLAY_COMPLETE",
          ],
        },
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Partition IDs
    const likedBlogIds = new Set<string>();
    const likedPodcastIds = new Set<string>();
    const sharedBlogIds = new Set<string>();
    const sharedPodcastIds = new Set<string>();
    const bookmarkedBlogIds = new Set<string>();
    const bookmarkedPodcastIds = new Set<string>();
    let readArticlesCount = 0;

    userEvents.forEach((ev) => {
      if (ev.eventType === "BLOG_LIKE" && ev.blogId) likedBlogIds.add(ev.blogId);
      if (ev.eventType === "PODCAST_LIKE" && ev.podcastId) likedPodcastIds.add(ev.podcastId);
      if (ev.eventType === "BLOG_SHARE" && ev.blogId) sharedBlogIds.add(ev.blogId);
      if (ev.eventType === "PODCAST_SHARE" && ev.podcastId) sharedPodcastIds.add(ev.podcastId);
      if (ev.eventType === "BLOG_BOOKMARK" && ev.blogId) bookmarkedBlogIds.add(ev.blogId);
      if (ev.eventType === "PODCAST_BOOKMARK" && ev.podcastId) bookmarkedPodcastIds.add(ev.podcastId);
      if (ev.eventType === "BLOG_READ") readArticlesCount++;
    });

    // Collect all unique blog and podcast IDs to query in batch
    const allBlogIds = Array.from(
      new Set([
        ...blogAccessIds,
        ...Array.from(likedBlogIds),
        ...Array.from(sharedBlogIds),
        ...Array.from(bookmarkedBlogIds),
      ])
    );

    const allPodcastIds = Array.from(
      new Set([
        ...podcastAccessIds,
        ...Array.from(likedPodcastIds),
        ...Array.from(sharedPodcastIds),
        ...Array.from(bookmarkedPodcastIds),
      ])
    );

    // Query Blogs
    const blogs = allBlogIds.length > 0
      ? await prisma.blog.findMany({
          where: { id: { in: allBlogIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            categories: true,
            category: true,
            authorName: true,
            publishedAt: true,
            createdAt: true,
            isPremium: true,
            price: true,
            currency: true,
            media: true,
            author: { select: { name: true, profileImage: true } },
          },
        })
      : [];

    const blogsMap = new Map(blogs.map((b) => [b.id, b]));

    // Query Podcasts
    const podcasts = allPodcastIds.length > 0
      ? await prisma.podcast.findMany({
          where: { id: { in: allPodcastIds } },
          select: {
            id: true,
            podcastId: true,
            title: true,
            description: true,
            coverImageUrl: true,
            audioUrl: true,
            duration: true,
            episodeNumber: true,
            releaseDate: true,
            isFeatured: true,
            isPremium: true,
            price: true,
            currency: true,
            previewDuration: true,
            media: true,
          },
        })
      : [];

    const podcastsMap = new Map(podcasts.map((p) => [p.id, p]));

    // Query Videos
    const videos = videoAccessIds.length > 0
      ? await prisma.video.findMany({
          where: { id: { in: videoAccessIds } },
          include: { mediaAsset: true, album: true },
        })
      : [];
    const videosMap = new Map(videos.map((v) => [v.id, v]));

    // Query Video Albums
    const videoAlbums = albumAccessIds.length > 0
      ? await prisma.videoAlbum.findMany({
          where: { id: { in: albumAccessIds } },
          include: { videos: { include: { mediaAsset: true } } },
        })
      : [];
    const videoAlbumsMap = new Map(videoAlbums.map((a) => [a.id, a]));

    // Query Photo Albums
    const photoAlbums = photoAlbumAccessIds.length > 0
      ? await prisma.photoAlbum.findMany({
          where: { id: { in: photoAlbumAccessIds } },
          include: { photos: { include: { mediaAsset: true } } },
        })
      : [];
    const photoAlbumsMap = new Map(photoAlbums.map((a) => [a.id, a]));

    // Query Content
    const contents = contentAccessIds.length > 0
      ? await prisma.content.findMany({
          where: { id: { in: contentAccessIds } },
          include: { mediaAsset: true },
        })
      : [];
    const contentsMap = new Map(contents.map((c) => [c.id, c]));

    // Format Subscribed Items
    const subscribed = accessRecords
      .map((access) => {
        if (access.contentType === "BLOG") {
          const blog = blogsMap.get(access.contentId);
          if (!blog) return null;
          const media = resolveBlogMedia(blog);
          return {
            id: blog.id,
            type: "BLOG" as const,
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            coverImage: media.coverUrl,
            category: blog.category || blog.categories?.[0] || "Article",
            author: blog.author?.name || blog.authorName || "Editorial Team",
            price: access.amount || blog.price,
            currency: access.currency || blog.currency,
            unlockedAt: access.createdAt,
            url: `/site/${slug}/blog/listings/${blog.id}`,
            isPremium: true,
          };
        } else if (access.contentType === "PODCAST") {
          const podcast = podcastsMap.get(access.contentId);
          if (!podcast) return null;
          const media = resolvePodcastMedia(podcast);
          return {
            id: podcast.id,
            type: "PODCAST" as const,
            title: podcast.title,
            slug: podcast.podcastId,
            excerpt: podcast.description,
            coverImage: media.coverUrl,
            category: "Podcast Episode",
            author: "Broadcast Host",
            duration: media.durationFormatted,
            price: access.amount || podcast.price,
            currency: access.currency || podcast.currency,
            unlockedAt: access.createdAt,
            url: `/site/${slug}/blog/podcasts/${podcast.id}`,
            isPremium: true,
          };
        } else if (access.contentType === "VIDEO") {
          const video = videosMap.get(access.contentId);
          if (!video) return null;
          return {
            id: video.id,
            type: "VIDEO" as const,
            title: video.title || video.album?.title || "Video Feature",
            slug: video.id,
            excerpt: video.description || "",
            coverImage: video.mediaAsset?.thumbnailUrl || video.mediaAsset?.url || "",
            category: "Video",
            author: "Media Producer",
            duration: video.duration || "",
            price: access.amount || 0,
            currency: access.currency || "USD",
            unlockedAt: access.createdAt,
            url: `/site/${slug}/media/products/${video.id}`,
            isPremium: true,
          };
        } else if (access.contentType === "ALBUM") {
          const album = videoAlbumsMap.get(access.contentId);
          if (!album) return null;
          return {
            id: album.id,
            type: "ALBUM" as const,
            title: album.title,
            slug: album.id,
            excerpt: album.description || "",
            coverImage: album.videos?.[0]?.mediaAsset?.thumbnailUrl || album.videos?.[0]?.mediaAsset?.url || "",
            category: "Video Album",
            author: "Media Producer",
            itemCount: album.videos?.length || 0,
            price: access.amount || 0,
            currency: access.currency || "USD",
            unlockedAt: access.createdAt,
            url: `/site/${slug}/media/products/${album.id}`,
            isPremium: true,
          };
        } else if (access.contentType === "PHOTO_ALBUM") {
          const pAlbum = photoAlbumsMap.get(access.contentId);
          if (!pAlbum) return null;
          return {
            id: pAlbum.id,
            type: "PHOTO_ALBUM" as const,
            title: pAlbum.title,
            slug: pAlbum.id,
            excerpt: pAlbum.description || "",
            coverImage: pAlbum.photos?.[0]?.mediaAsset?.url || "",
            category: "Photo Gallery",
            author: "Staff Photographer",
            itemCount: pAlbum.photos?.length || 0,
            price: access.amount || 0,
            currency: access.currency || "USD",
            unlockedAt: access.createdAt,
            url: `/site/${slug}/media/gallery`,
            isPremium: true,
          };
        } else if (access.contentType === "CONTENT") {
          const item = contentsMap.get(access.contentId);
          if (!item) return null;
          return {
            id: item.id,
            type: "CONTENT" as const,
            title: item.title,
            slug: item.id,
            excerpt: item.description || "",
            coverImage: item.mediaAsset?.thumbnailUrl || item.mediaAsset?.url || "",
            category: item.type || "Exclusive Media",
            author: "Content Creator",
            price: access.amount || 0,
            currency: access.currency || "USD",
            unlockedAt: access.createdAt,
            url: `/site/${slug}/media/products/${item.id}`,
            isPremium: true,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Format Liked Items
    const liked: any[] = [];
    likedBlogIds.forEach((bId) => {
      const blog = blogsMap.get(bId);
      if (blog) {
        const media = resolveBlogMedia(blog);
        liked.push({
          id: blog.id,
          type: "BLOG" as const,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          coverImage: media.coverUrl,
          category: blog.category || blog.categories?.[0] || "Article",
          author: blog.author?.name || blog.authorName || "Editorial Team",
          url: `/site/${slug}/blog/listings/${blog.id}`,
          isPremium: blog.isPremium,
          price: blog.price,
          currency: blog.currency,
        });
      }
    });
    likedPodcastIds.forEach((pId) => {
      const podcast = podcastsMap.get(pId);
      if (podcast) {
        const media = resolvePodcastMedia(podcast);
        liked.push({
          id: podcast.id,
          type: "PODCAST" as const,
          title: podcast.title,
          slug: podcast.podcastId,
          excerpt: podcast.description,
          coverImage: media.coverUrl,
          category: "Podcast Episode",
          author: "Broadcast Host",
          duration: media.durationFormatted,
          url: `/site/${slug}/blog/podcasts/${podcast.id}`,
          isPremium: podcast.isPremium,
          price: podcast.price,
          currency: podcast.currency,
        });
      }
    });

    // Format Shared Items
    const shared: any[] = [];
    sharedBlogIds.forEach((bId) => {
      const blog = blogsMap.get(bId);
      if (blog) {
        const media = resolveBlogMedia(blog);
        shared.push({
          id: blog.id,
          type: "BLOG" as const,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          coverImage: media.coverUrl,
          category: blog.category || blog.categories?.[0] || "Article",
          author: blog.author?.name || blog.authorName || "Editorial Team",
          url: `/site/${slug}/blog/listings/${blog.id}`,
          isPremium: blog.isPremium,
        });
      }
    });
    sharedPodcastIds.forEach((pId) => {
      const podcast = podcastsMap.get(pId);
      if (podcast) {
        const media = resolvePodcastMedia(podcast);
        shared.push({
          id: podcast.id,
          type: "PODCAST" as const,
          title: podcast.title,
          slug: podcast.podcastId,
          excerpt: podcast.description,
          coverImage: media.coverUrl,
          category: "Podcast Episode",
          author: "Broadcast Host",
          duration: media.durationFormatted,
          url: `/site/${slug}/blog/podcasts/${podcast.id}`,
          isPremium: podcast.isPremium,
        });
      }
    });

    // Format Bookmarked Items
    const bookmarked: any[] = [];
    bookmarkedBlogIds.forEach((bId) => {
      const blog = blogsMap.get(bId);
      if (blog) {
        const media = resolveBlogMedia(blog);
        bookmarked.push({
          id: blog.id,
          type: "BLOG" as const,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          coverImage: media.coverUrl,
          category: blog.category || blog.categories?.[0] || "Article",
          author: blog.author?.name || blog.authorName || "Editorial Team",
          url: `/site/${slug}/blog/listings/${blog.id}`,
          isPremium: blog.isPremium,
          price: blog.price,
          currency: blog.currency,
        });
      }
    });
    bookmarkedPodcastIds.forEach((pId) => {
      const podcast = podcastsMap.get(pId);
      if (podcast) {
        const media = resolvePodcastMedia(podcast);
        bookmarked.push({
          id: podcast.id,
          type: "PODCAST" as const,
          title: podcast.title,
          slug: podcast.podcastId,
          excerpt: podcast.description,
          coverImage: media.coverUrl,
          category: "Podcast Episode",
          author: "Broadcast Host",
          duration: media.durationFormatted,
          url: `/site/${slug}/blog/podcasts/${podcast.id}`,
          isPremium: podcast.isPremium,
          price: podcast.price,
          currency: podcast.currency,
        });
      }
    });

    return NextResponse.json({
      success: true,
      subscribed,
      liked,
      shared,
      bookmarked,
      stats: {
        subscribedCount: subscribed.length,
        likedCount: liked.length,
        sharedCount: shared.length,
        bookmarkedCount: bookmarked.length,
        articlesReadCount: Math.max(readArticlesCount, Math.floor(userEvents.length * 0.4)),
      },
    });
  } catch (error: any) {
    console.error("[GET_USER_CONTENT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const email = session.user.email || "";

    const { action, contentType, contentId } = await request.json();

    if (!action || !contentType || !contentId) {
      return NextResponse.json(
        { error: "Missing required fields: action, contentType, contentId" },
        { status: 400 }
      );
    }

    const { slug } = await params;
    const company = await prisma.company.findFirst({
      where: { OR: [{ slug }, { id: slug.length === 24 ? slug : undefined }] },
      select: { id: true },
    });

    const companyId = company?.id;

    if (action === "bookmark") {
      const eventType = contentType === "BLOG" ? "BLOG_BOOKMARK" : "PODCAST_BOOKMARK";
      await prisma.productInteractionEvent.create({
        data: {
          eventType: eventType as any,
          blogId: contentType === "BLOG" ? contentId : null,
          podcastId: contentType === "PODCAST" ? contentId : null,
          companyId: companyId || null,
          userId: userId || null,
          customerId: email || null,
          channel: "STORE",
        },
      });
      return NextResponse.json({ success: true, bookmarked: true });
    }

    if (action === "unbookmark") {
      const eventType = contentType === "BLOG" ? "BLOG_BOOKMARK" : "PODCAST_BOOKMARK";
      await prisma.productInteractionEvent.deleteMany({
        where: {
          eventType: eventType as any,
          blogId: contentType === "BLOG" ? contentId : undefined,
          podcastId: contentType === "PODCAST" ? contentId : undefined,
          OR: [
            ...(userId ? [{ userId }, { consumerId: userId }] : []),
            ...(email ? [{ customerId: email }] : []),
          ],
        },
      });
      return NextResponse.json({ success: true, bookmarked: false });
    }

    if (action === "like") {
      const eventType = contentType === "BLOG" ? "BLOG_LIKE" : "PODCAST_LIKE";
      await prisma.productInteractionEvent.create({
        data: {
          eventType: eventType as any,
          blogId: contentType === "BLOG" ? contentId : null,
          podcastId: contentType === "PODCAST" ? contentId : null,
          companyId: companyId || null,
          userId: userId || null,
          customerId: email || null,
          channel: "STORE",
        },
      });
      return NextResponse.json({ success: true, liked: true });
    }

    if (action === "share") {
      const eventType = contentType === "BLOG" ? "BLOG_SHARE" : "PODCAST_SHARE";
      await prisma.productInteractionEvent.create({
        data: {
          eventType: eventType as any,
          blogId: contentType === "BLOG" ? contentId : null,
          podcastId: contentType === "PODCAST" ? contentId : null,
          companyId: companyId || null,
          userId: userId || null,
          customerId: email || null,
          channel: "STORE",
        },
      });
      return NextResponse.json({ success: true, shared: true });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    console.error("[POST_USER_CONTENT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
