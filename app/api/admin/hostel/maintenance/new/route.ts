import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, category, priority, description } = body;

    // 1. Get the current logged-in user ID (Example via headers or session)
    // Replace this with your actual session retrieval logic
    const userId = req.headers.get("x-user-id"); 

    const newTicket = await prisma.hostelMaintenanceRequest.create({
      data: {
        roomId,
        category,
        priority,
        description,
        reportedBy: userId!, // Ensure this is valid
        status: "PENDING"
      },
      include: {
        room: { select: { roomNumber: true } },
        reporter: { select: { name: true } }
      }
    });

    // Format for the UI
    const formatted = {
      id: `TKT-${newTicket.id.slice(-4).toUpperCase()}`,
      dbId: newTicket.id,
      room: newTicket.room.roomNumber,
      category: newTicket.category,
      issue: newTicket.description,
      priority: newTicket.priority,
      status: newTicket.status,
      reportedBy: { name: newTicket.reporter.name }
    };

    return NextResponse.json({ data: formatted });
  } catch (error) {
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
// export async function POST(req: Request) {
//   try {
//     const { roomId, userId, category, priority, description } = await req.json();

//     const ticket = await prisma.hostelMaintenanceRequest.create({
//       data: {
//         roomId,
//         userId, // The admin's ID or the student's ID if known
//         category, // Enum: PLUMBING, ELECTRICAL, FURNITURE, OTHER
//         priority, // Enum: LOW, MEDIUM, HIGH
//         description,
//         status: "PENDING",
//       },
//       include: {
//         room: { select: { roomNumber: true } }
//       }
//     });

//     return NextResponse.json({ data: ticket }, { status: 201 });
//   } catch (error) {
//     console.error("Maintenance Error:", error);
//     return NextResponse.json({ error: "Failed to log request" }, { status: 500 });
//   }
// }