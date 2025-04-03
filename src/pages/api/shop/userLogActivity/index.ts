import { NextApiRequest, NextApiResponse } from "next";
import prisma, { client } from "@/server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId, productId, action } = req.body;
  if (!userId || !productId || !action) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Log the user action
    await prisma.userActivity.create({
      data: { userId, productId, action },
    });

    return res.status(200).json({ message: "User activity logged successfully" });
  } catch (error) {
    console.error("Error logging user activity:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

