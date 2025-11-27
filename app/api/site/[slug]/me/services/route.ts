/**
 * app/api/site/[slug]/me/services/route.ts
 * 
 * GET /api/site/[slug]/me/services
 * Returns user's services for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserServices } from "@/lib/db";
import { mapToServiceDTO, ServicesListDTO } from "@/types/dto";

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

    const services = await getUserServices(userId, slug, filters);
    
    const serviceDTOs = services.map(mapToServiceDTO);
    
    const response: ServicesListDTO = {
      items: serviceDTOs,
      nextCursor: services.length === filters.limit ? services[services.length - 1]?.id || null : null,
      total: serviceDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
