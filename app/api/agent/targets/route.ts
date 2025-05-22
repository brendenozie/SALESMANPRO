import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Extract the salesAgentId from query parameters
      const { salesAgentId } = req.query;

      // Ensure salesAgentId is provided
      if (!salesAgentId) {
        return res.status(400).json({ error: "Sales Agent ID is required" });
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
      res.status(500).json({ error: "Failed to fetch targets" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
