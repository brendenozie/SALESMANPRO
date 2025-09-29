import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";


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
    // const requests = await prisma.productRequest.findMany({
    //   where: { salesAgent: { clients: { some: { id: customerId.toString() } } } },
    //   include: {
    //     product: {
    //       select: { name: true },
    //     },
    //   },
    // });

    // const formattedRequests = requests.map((request) => ({
    //   productId: request.productId,
    //   name: request.product.name,
    //   quantity: request.quantity,
    //   status: request.status,
    // }));

    // res.status(200).json(formattedRequests);
  } catch (error) {
    console.error(error);
    NextResponse.json({ message: "Internal server error." });
  }
}
