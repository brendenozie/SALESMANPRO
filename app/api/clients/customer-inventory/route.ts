import { NextApiRequest, NextApiResponse } from "next";

import prisma, { client } from "../../../server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ message: "Customer ID is required." });
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
    res.status(500).json({ message: "Internal server error." });
  }
}
