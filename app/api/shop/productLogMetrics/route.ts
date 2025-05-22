import { NextApiRequest, NextApiResponse } from "next";
import prisma, { client } from "../../../../server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { productId, action } = req.body;
  if (!productId || !action) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Update the product metrics
    await prisma.productMetrics.upsert({
      where: { productId },
      update: {
        views: action === "view" ? { increment: 1 } : undefined,
        purchases: action === "purchase" ? { increment: 1 } : undefined,
        favorites: action === "favorite" ? { increment: 1 } : undefined,
      },
      create: {
        productId,
        views: action === "view" ? 1 : 0,
        purchases: action === "purchase" ? 1 : 0,
        favorites: action === "favorite" ? 1 : 0,
      },
    });

    return res.status(200).json({ message: "Product metrics updated successfully" });
  } catch (error) {
    console.error("Error updating product metrics:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

