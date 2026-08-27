/**
 * app/api/site/[slug]/me/profile/route.ts
 * 
 * GET /api/site/[slug]/me/profile
 * Returns user profile data for the authenticated user in the context of a specific vertical/site.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserProfileForVertical, getUserStats } from "@/lib/db";
import { mapToUserProfileDTO, UserProfileDTO } from "@/types/dto";

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

    // Get user profile data
    const user = await getUserProfileForVertical(userId, slug);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user stats
    const stats = await getUserStats(userId, slug);

    // Map to DTO
    const profileDTO: UserProfileDTO = {
      ...mapToUserProfileDTO(user),
      points: stats.orderCount * 10, // Simple points calculation
      tier: stats.orderCount > 10 ? "Premium" : "Standard",
    };

    return NextResponse.json(profileDTO);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { name, phone, bio, address } = body;

    // Import prisma directly for update
    const prisma = (await import("@/server/db/prismadb")).default;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(address !== undefined && { address }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        profilePicture: true,
        bio: true,
        address: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(mapToUserProfileDTO(updatedUser));
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
