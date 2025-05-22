import { NextApiRequest, NextApiResponse } from "next";

import prisma, { client } from "../../../../server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { userId, latitude, longitude, address, description } = req.body;

    if (!userId || !latitude || !longitude || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Upsert location for the user
    const location = await prisma.location.upsert({
      where: { userId },
      update: { latitude, longitude, address, description },
      create: { userId, latitude, longitude, address, description },
    });

    res.status(200).json({ message: "Location updated", location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}
