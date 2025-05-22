import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method Not Allowed" });
  }

  try {
    const { userId } = req.query;
    const { searchParams } = new URL(req.url);
  
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return NextResponse.json(
        { message: "Invalid pagination parameters." },
        { status: 400 }
      );
    }
  

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" });
    }

    const location = await prisma.location.findUnique({
      where: { userId: String(userId) },
    });

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json(location);
  } catch (error) {
    console.error(error);
    NextResponse.json({ message: "Server Error" });
  }
}
