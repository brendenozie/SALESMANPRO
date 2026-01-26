import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  try {
    const residents = await prisma.hostelAllocation.findMany({
      where: {
        room: { block: { companyId: companyId } },
        status: "ACTIVE" // Only show current residents
      },
      include: {
        user: true, // The student/resident
        room: true, // Room details
      }
    });

    const data = residents.map((res) => ({
      id: res.user?.id,
      studentId: res.user.id.slice(-7).toUpperCase(), // Display friendly ID
      name: res.user.name,
      room: res.room.roomNumber,
      grade: "N/A", //res.user.grade || 
      bloodGroup: "Unknown", //res.user.bloodGroup || 
      parent: "Not Listed", //res.user.parentName || 
      phone: res.user.phone || "No Contact",
      status: "In-House" // You can add logic for 'On-Leave' if you have a leave model
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch residents" }, { status: 500 });
  }
}