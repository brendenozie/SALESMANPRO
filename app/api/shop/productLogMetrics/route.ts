import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" });
  }

  const { productId, action } = req.body;
  if (!productId || !action) {
    return NextResponse.json({ error: "Missing required fields" });
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
    return NextResponse.json({ error: "Internal Server Error" });
  }
}

