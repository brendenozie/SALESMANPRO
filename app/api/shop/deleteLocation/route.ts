import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paramUserId = searchParams.get("userId");

    const session = await getServerSession(authOptions());
    const effectiveUserId = paramUserId || session?.user?.id;

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete address records associated with user
    await prisma.address.deleteMany({
      where: { userId: effectiveUserId },
    });

    // Also clear user's address field
    await prisma.user.update({
      where: { id: effectiveUserId },
      data: { address: null },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/shop/deleteLocation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete location" },
      { status: 500 }
    );
  }
}
