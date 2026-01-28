import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get("blockId");
  const roomId = searchParams.get("roomId");

  if (!blockId) {
    return NextResponse.json({ error: "blockId is required" }, { status: 400 });
  }

  try {
    const residents = await prisma.hostelAllocation.findMany({
      where: {
        room: { block: { id: blockId }, ...(roomId ? { id: roomId } : {}) },
        status: "ACTIVE" // Only show current residents
      },
      include: {
        hostelMember: {
          select: {
            id: true,
            studentId: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
                phone: true,
              },
            include: {
                user: { select: { name: true } }
              }
            },
            educatorId: true,
            educator: {
              select: {
                id: true,
                userId: true,
                phone: true,
              },
              include: { user: { select: { name: true } } }
            },
          }
        },
        room: true, // Room details
      }
    });

    const data = residents.map((res) => ({
      id: res.hostelMember?.id,
      studentId: res.hostelMember?.id.slice(-7).toUpperCase(), // Display friendly ID
      name: res.hostelMember?.student
        ? `${res.hostelMember.student.firstName} ${res.hostelMember.student.lastName}`
        : res.hostelMember?.educator?.user?.name || "N/A",
      room: res.room.roomNumber,
      grade: "N/A", //res.hostelMember.grade || 
      bloodGroup: "Unknown", //res.hostelMember.bloodGroup || 
      parent: "Not Listed", //res.hostelMember.parentName || 
      phone: res.hostelMember?.student?.phone || res.hostelMember?.educator?.phone || "No Contact",
      status: "In-House" // You can add logic for 'On-Leave' if you have a leave model
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch residents" }, { status: 500 });
  }
}