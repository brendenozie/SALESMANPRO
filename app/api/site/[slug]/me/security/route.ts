/**
 * app/api/site/[slug]/me/security/route.ts
 * 
 * GET /api/site/[slug]/me/security
 * Returns user's security services for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserSecurity } from "@/lib/db";
import { mapToSecurityServiceDTO, SecurityListDTO } from "@/types/dto";

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

    const services = await getUserSecurity(userId, slug, filters);
    
    const serviceDTOs = services.map(mapToSecurityServiceDTO);
    
    const response: SecurityListDTO = {
      items: serviceDTOs,
      nextCursor: services.length === filters.limit ? services[services.length - 1]?.id || null : null,
      total: serviceDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user security services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
