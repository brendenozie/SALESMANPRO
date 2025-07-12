import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// GET /api/location?userId=&agentId=
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const agentId = searchParams.get("agentId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    // Optional: filter by agentId if needed (example placeholder)
    // const whereClause: any = { userId };
    // if (agentId) whereClause.agentId = agentId;

    const location = await prisma.location.findUnique({
      where: { userId: String(userId) },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(location, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: "Server error fetching location", detail: error.message },
      { status: 500 }
    );
  }
}