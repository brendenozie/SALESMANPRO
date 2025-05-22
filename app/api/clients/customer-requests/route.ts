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
    res.status(500).json({ message: "Internal server error." });
  }
}
