import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";


export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const communicationsToday = await prisma.communication.count({
      where: { createdAt: { gte: today } },
    });

    res.status(200).json({ today: communicationsToday });
  } catch (error) {
    console.error(error);
    NextResponse.json({ message: "Internal server error" });
  }
}
