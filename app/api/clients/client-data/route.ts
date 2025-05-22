import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newClients = await prisma.client.count({
      where: { createdAt: { gte: today } },
    });

    res.status(200).json({ newClients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
