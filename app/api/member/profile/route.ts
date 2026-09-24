import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const consumer = await prisma.consumer.findFirst({
      where: {
        userId,
        ...(companyId ? { companyId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, image: true, address: true } },
        fitnessMemberships: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          take: 1,
        },
      },
    });

    if (!consumer) {
      // Return basic user info if consumer record not yet created for this company
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, image: true, address: true },
      });
      return NextResponse.json({
        success: true,
        profile: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          avatar: user?.image,
          membershipType: "Guest",
          membershipStatus: "INACTIVE",
        },
      });
    }

    const activeMembership = consumer.fitnessMemberships[0];

    return NextResponse.json({
      success: true,
      profile: {
        id: consumer.id,
        userId: consumer.userId,
        name: consumer.user?.name,
        email: consumer.user?.email,
        phone: consumer.user?.phone,
        avatar: consumer.user?.image,
        membershipType: activeMembership?.plan?.name || consumer.membershipType || "Standard",
        membershipStatus: activeMembership ? "ACTIVE" : consumer.membershipStatus,
        membershipEndDate: activeMembership?.endDate,
        hasGymAccess: activeMembership?.plan?.hasGymAccess ?? false,
        hasClassAccess: activeMembership?.plan?.hasClassAccess ?? false,
        hasDigitalAccess: activeMembership?.plan?.hasDigitalAccess ?? true,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch member profile:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Failed to update member profile:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
