/**
 * app/api/site/[slug]/me/resources/route.ts
 * 
 * GET /api/site/[slug]/me/resources
 * Returns user's digital resources (ebooks, downloads) for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserResources } from "@/lib/db";
import { mapToResourceDTO, ResourceListDTO } from "@/types/dto";

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
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      sort: (searchParams.get("sort") || "desc") as "asc" | "desc",
    };

    const resources = await getUserResources(userId, slug, filters);
    
    // Flatten the resources from orders
    const resourceDTOs = resources.flatMap((order: any) => 
      (order.items || []).map(mapToResourceDTO)
    );
    
    const response: ResourceListDTO = {
      items: resourceDTOs,
      nextCursor: resources.length === filters.limit ? resources[resources.length - 1]?.id || null : null,
      total: resourceDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user resources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
