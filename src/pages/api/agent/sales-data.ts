import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/db/prismadb";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySales = await prisma.order.aggregate({
      _sum: { quantity: true },
      where: { createdAt: { gte: today } },
    });

    const totalSales = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { createdAt: { gte: today } },
    });

    const monthlyTarget = 1000; // Replace with your dynamic target if needed.
    const progress = (totalSales._sum?.totalPrice || 0) / monthlyTarget * 100;

  
    res.status(200).json({
      todaySales: dailySales._sum?.quantity || 0,
      monthlyTargetProgress: progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
