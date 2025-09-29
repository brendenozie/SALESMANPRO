// app/api/ama/[id]/route.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const amaId = req.query.id as string;

  if (req.method === "PUT") {
    try {
      // Example update (adjust to your actual data needs)
      const ama = await prisma.booking.update({
        where: { id: amaId },
        data: {
          reactions: { increment: 1 },
        },
      });

      return res
        .status(200)
        .json(formatResponse(true, ama, "AMA updated successfully"));
    } catch (error: any) {
      return res
        .status(500)
        .json(formatResponse(false, null, error.message || "Update failed"));
    }
  }

  return res
    .status(405)
    .json(formatResponse(false, null, "Method not allowed", 405));
}

export default withApiHandler(handler);
