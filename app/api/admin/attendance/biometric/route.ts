import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";


export async function POST(req: Request) {
  // Authentication check: Ensure the request comes from the registered Device ID
  const apiKey = req.headers.get("x-device-key");
  const { staffHardwareId, timestamp, deviceId } = await req.json();

  if (!apiKey) {
    return Response.json({ error: "Missing Device API Key" }, { status: 401 });
  }

  const device = await prisma.device.findUnique({ where: { apiKey } });
  if (!device) return Response.json({ error: "Unauthorized Device" }, { status: 401 });

  // 1. Map Hardware ID to System User ID
  const user = await prisma.user.findFirst({ 
    where: { hardwareId: staffHardwareId, companyId: device.companyId } 
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  // 2. Automatic In/Out Detection
  // If user has no Clock-In today, this is an 'IN'. If they have an 'IN' but no 'OUT', this is an 'OUT'.
  const today = new Date();
  today.setHours(0,0,0,0);

  const existing = await prisma.staffAttendanceRecord.findUnique({
    where: { userId_date: { userId: user.id, date: today } }
  });

  if (!existing) {
    // Create new Clock-In
    await prisma.staffAttendanceRecord.create({
      data: { 
        userId: user.id, 
        companyId: device.companyId, 
        date: today, 
        checkInTime: new Date(timestamp),
        method: 'BIOMETRIC' 
      }
    });
  } else if (existing.checkInTime && !existing.checkOutTime) {
    // Update existing with Clock-Out
    await prisma.staffAttendanceRecord.update({
      where: { id: existing.id },
      data: { checkOutTime: new Date(timestamp) }
    });
  }

  return Response.json({ success: true });
}