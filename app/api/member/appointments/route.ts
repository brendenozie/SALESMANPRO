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

    const consumers = await prisma.consumer.findMany({
      where: {
        userId,
        ...(companyId ? { companyId } : {}),
      },
      select: { id: true },
    });

    const consumerIds = consumers.map((c) => c.id);

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { consumerId: { in: consumerIds } },
          { userId },
        ],
      },
      include: {
        educator: {
          select: {
            id: true,
            specialty: true,
            user: { select: { name: true, image: true, email: true } },
          },
        },
        location: { select: { id: true, name: true, address: true } },
      },
      orderBy: { startTime: "desc" },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      title: b.title || "Training Session",
      bookingType: b.bookingType,
      status: b.status,
      startTime: b.startTime,
      endTime: b.endTime,
      price: b.price,
      notes: b.notes,
      trainer: b.educator ? {
        id: b.educator.id,
        name: b.educator.user?.name || "Fitness Trainer",
        specialty: b.educator.specialty,
        image: b.educator.user?.image,
      } : null,
      location: b.location?.name || "Main Facility",
    }));

    return NextResponse.json({ success: true, appointments: formatted });
  } catch (error: any) {
    console.error("Failed to fetch member appointments:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
