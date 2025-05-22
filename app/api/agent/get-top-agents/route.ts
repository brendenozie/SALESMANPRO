import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


// GET top-performing agents
export async function getTopAgents(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" });
  }

  try {
    const topAgents = await prisma.salesAgent.findMany({
      // orderBy: { totalSales: "desc" },
      // select: { name: true, totalSales: true },
    });

    res.status(200).json(topAgents);
  } catch (error) {
    console.error(error);
    NextResponse.json({ message: "Internal server error" });
  }
}
