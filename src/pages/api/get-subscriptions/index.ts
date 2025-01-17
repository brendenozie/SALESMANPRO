import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page, userId } = req.query;
  if (req.method === 'GET') {
        try {
            const plans = await prisma.subscriptionPlan.findMany();
            res.status(200).json(plans);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching subscription plans' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
