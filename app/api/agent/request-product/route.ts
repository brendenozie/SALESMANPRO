import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function GET( req : Request ) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed. Use POST." });
  }

  const { salesAgentId, productId, quantity, } = req.body;

  // Validate the request body
  if (!salesAgentId || !productId || !quantity || typeof quantity !== "number") {
    return NextResponse.json({ message: "Invalid or missing request data." });
  }

  try {


    const data: any = {
      requestedById: salesAgentId,
      requestedByType: "SALES_AGENT",
      product: { connect: { id: productId } },
      quantity,
      status: "PENDING",
    };

    // Add salesAgent if provided
    // if (salesAgentId) {
    //   data.salesAgent = { connect: { id: salesAgentId } };
    // }

    // Create the product request
    const productRequest = await prisma.request.create({
      data,
    });

    // Check if the product exists
    // const product = await prisma.product.findUnique({
    //   where: { id: productId },
    // });

    // if (!product) {
    //   return res.status(404).json({ message: "Product not found." });
    // }

    // // Check if the client exists
    // const client = await prisma.client.findUnique({
    //   where: { id: clientId },
    // });

    // if (!client) {
    //   return res.status(404).json({ message: "Client not found." });
    // }

    // // If salesAgentId is provided, check if the sales agent exists
    // let salesAgent = null;
    // if (salesAgentId) {
    //   salesAgent = await prisma.salesAgent.findUnique({
    //     where: { id: salesAgentId },
    //   });

    //   if (!salesAgent) {
    //     return res.status(404).json({ message: "Sales agent not found." });
    //   }
    // }

    // // Create the request
    // const productRequest = await prisma.request.create({
    //   data: {
    //     requestedById: clientId,
    //     requestedByType: "CLIENT", // Assuming the type is CLIENT
    //     product: {
    //       connect: { id: productId },
    //     },
    //     quantity,
    //     salesAgent: salesAgentId || null, // Associate with the sales agent or leave null for the company
    //     status: "PENDING", // Default status
    //   },
    // });

    // // Respond with the created request
    return res.status(201).json({
      message: "Product request created successfully.",
      request: {
        requestId: productRequest.id,
        productId: productRequest.productId,
        clientId: productRequest.requestedById,
        quantity: productRequest.quantity,
        salesAgentId: productRequest.salesAgentId,
        status: productRequest.status,
        createdAt: productRequest.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error creating product request:", error);

    return NextResponse.json({
      message: "An error occurred while creating the product request.",
      error: error.message || "Unknown error",
    });
  }
}
