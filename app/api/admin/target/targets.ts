import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Fetch Targets with related SalesAgent and Product data
      const targets = await prisma.target.findMany({
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
