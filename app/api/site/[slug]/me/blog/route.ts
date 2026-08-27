/**
 * app/api/site/[slug]/me/blog/route.ts
 * 
 * GET /api/site/[slug]/me/blog
 * Returns user's blog entries for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserBlogs } from "@/lib/db";
import { mapToBlogDTO, BlogListDTO } from "@/types/dto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      tags: searchParams.get("tags")?.split(",") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    const blogs = await getUserBlogs(userId, slug, filters);
    
    const blogDTOs = blogs.map(mapToBlogDTO);
    
    const response: BlogListDTO = {
      items: blogDTOs,
      nextCursor: blogs.length === filters.limit ? blogs[blogs.length - 1]?.id || null : null,
      total: blogDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
