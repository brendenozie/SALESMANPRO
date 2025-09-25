import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";


export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" });
  }

  const { customerId } = req.query;
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
  

  if (!customerId) {
    return NextResponse.json({ message: "Customer ID is required." });
  }

  try {
    // const inventory = await prisma.agentInventory.findMany({
    //   where: { salesAgent: { clients: { some: { id: customerId.toString() } } } },
    //   include: {
    //     product: {
    //       select: { name: true, description: true },
    //     },
    //   },
    // });

    // const formattedInventory = inventory.map((item) => ({
    //   productId: item.productId,
    //   name: item.product.name,
    //   description: item.product.description,
    //   quantity: item.quantity,
    // }));

    // res.status(200).json(formattedInventory);
  } catch (error) {
    console.error(error);
    NextResponse.json({ message: "Internal server error." });
  }
}
