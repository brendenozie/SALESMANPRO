/**
 * app/api/site/[slug]/me/addresses/route.ts
 * 
 * GET /api/site/[slug]/me/addresses
 * Returns user's addresses for a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserAddresses } from "@/lib/db";
import { mapToAddressDTO, AddressListDTO } from "@/types/dto";

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
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
    };

    const addresses = await getUserAddresses(userId, slug, filters);
    
    const addressDTOs = addresses.map(mapToAddressDTO);
    
    const response: AddressListDTO = {
      items: addressDTOs,
      total: addressDTOs.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
