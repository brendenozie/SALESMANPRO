import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";


export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" });
  }

  const { productId, quantity, customerId, salesAgentId } = req.body;

  if (!productId || !quantity || !customerId || !salesAgentId) {
    return NextResponse.json({ message: "All fields are required." });
  }

  try {
    // const request = await prisma.productRequest.create({
    //   data: {
    //     productId,
    //     quantity,
    //     companyId: salesAgentId, // Assuming sales agent's company is used.
    //     salesAgentId,
    //     status: "PENDING",
    //   },
    // });

    res.status(201).json("request");
  } catch (error) {
    console.error(error);
    NextResponse.json({ message: "Failed to create product request." });
  }
}
