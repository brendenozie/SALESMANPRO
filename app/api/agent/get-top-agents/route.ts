import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";
import { request } from "http";
import { NextApiRequest, NextApiResponse } from "next";


// GET top-performing agents
export async function getTopAgents(req: NextApiRequest, res: NextApiResponse) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
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
