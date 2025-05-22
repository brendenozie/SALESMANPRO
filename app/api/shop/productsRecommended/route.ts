import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method Not Allowed" });
  }

  const { userId } = req.query;
  
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
  

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" });
  }

  try {
    // Find recently interacted products by the user
    const recentInteractions = await prisma.userActivity.findMany({
      where: { userId: String(userId) },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { product: true },
    });

    if (!recentInteractions.length) {
      return res.status(200).json([]);
    }

    // Extract category & tags of recently interacted products
    const productCategories = recentInteractions.map((interaction) => interaction.product?.productCategoryId);
    const productTags = recentInteractions.flatMap((interaction) => interaction.product?.tags || []);

    // Find similar products based on category & tags
    const recommendedProducts = await prisma.marketplaceListing.findMany({
      where: {
        OR: [
          { productCategoryId: { in: productCategories } },
          { tags: { hasSome: productTags } },
        ],
        NOT: { id: { in: recentInteractions.map((i) => i.productId) } }, // Exclude already interacted products
      },
      take: 10,
    });

    return res.status(200).json(recommendedProducts);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
