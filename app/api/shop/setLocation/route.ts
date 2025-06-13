import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb";
import { rateLimit } from "../../../../lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "local";

  if (!rateLimit(ip)) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { userId, latitude, longitude, address, description } = body;

    if (!userId || !latitude || !longitude || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const location = await prisma.location.upsert({
      where: { userId },
      update: { latitude, longitude, address, description },
      create: { userId, latitude, longitude, address, description },
    });

    return NextResponse.json(
      { message: "Location updated", location },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
