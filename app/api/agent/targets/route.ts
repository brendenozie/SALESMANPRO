import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";
import { request } from "http";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method === "GET") {
    try {
      // Extract the salesAgentId from query parameters
      const { salesAgentId } = req.query;
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
  

      // Ensure salesAgentId is provided
      if (!salesAgentId) {
        return NextResponse.json({ error: "Sales Agent ID is required" });
      }

      // Fetch targets for the specific sales agent with related SalesAgent and Product data
      const targets = await prisma.target.findMany({
        where: {
          salesAgentId: salesAgentId as string, // Ensure the ID matches the provided parameter
        },
        include: {
          salesAgent: true,
          product: true,
        },
      });

      res.status(200).json(targets);
    } catch (error) {
      console.error("Error fetching targets:", error);
      NextResponse.json({ error: "Failed to fetch targets" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    NextResponse.end(`Method ${req.method} Not Allowed`);
  }
}
