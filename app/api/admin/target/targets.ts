import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";
import { OrderStatus } from "@prisma/client";
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Fetch Targets with related SalesAgent and Product data
      const targets = await prisma.target.findMany({
        include: {
          salesAgent: true,
          product: true,
        },
      });
      res.status(200).json(targets);
    } catch (error) {
      console.error("Error fetching targets:", error);
      res.status(500).json({ error: "Failed to fetch targets" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
