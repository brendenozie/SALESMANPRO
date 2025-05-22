import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
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
    res.status(500).json({ message: "Internal server error" });
  }
}
