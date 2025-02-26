import { NextApiRequest, NextApiResponse } from "next";

import prisma, { client } from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { productId, quantity, customerId, salesAgentId } = req.body;

  if (!productId || !quantity || !customerId || !salesAgentId) {
    return res.status(400).json({ message: "All fields are required." });
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
    res.status(500).json({ message: "Failed to create product request." });
  }
}
