import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function PATCH(req: Request) {
  try {
    const { userId } = await req.json();

    // Find the active allocation for this user and close it
    const updatedAllocation = await prisma.hostelAllocation.updateMany({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
      data: {
        status: "INACTIVE", // or whatever status you use in your Enum
        endDate: new Date(),
      },
    });

    if (updatedAllocation.count === 0) {
      return NextResponse.json({ error: "No active allocation found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Check-out successful" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process check-out" }, { status: 500 });
  }
}