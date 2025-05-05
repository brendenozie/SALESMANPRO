// pages/api/stores/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const session = await getSession({ req });
  // if (!session) {
  //   return res.status(401).json({ error: "Unauthorized" });
  // }

  switch (req.method) {
    case "GET":
      try {
        // if (!session.user) {
        //   return res.status(401).json({ error: "Unauthorized: User not found in session" });
        // }
        const stores = await prisma.company.findMany({
          where: { 
            // userId: session.user.id,
            userId: "67c5b0192e2372b5f2366dbf",//session.user.id,
          },//session.user.id
        });
        return res.status(200).json(stores);
      } catch (error) {
        console.error("GET /api/stores error:", error);
        return res.status(500).json({ error: "Failed to fetch stores" });
      }

    case "POST":
      try {
        const {
          name,
          slug,
          description,
          category,
          logoUrl,
          bannerUrl,
          contactEmail,
          contactPhone,
          address,
          socialLinks,
          policies,
          shippingZones,
        } = req.body;

        // if (!session.user) {
        //   return res.status(401).json({ error: "Unauthorized: User not found in session" });
        // }

        const newStore = await prisma.company.create({
          data: {
            name,
            slug,
            description,
            category,
            logoUrl,
            bannerUrl,
            contactEmail,
            contactPhone,
            address,
            socialLinks,
            policies,
            shippingZones,
            user: { connect: { id: "67c5b0192e2372b5f2366dbf", } },//session.user.id
          },
        });

        return res.status(201).json(newStore);
      } catch (error) {
        console.error("POST /api/stores error:", error);
        return res.status(500).json({ error: "Failed to create store" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
