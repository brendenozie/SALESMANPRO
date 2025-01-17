import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../server/db/prismadb";

// POST /api/post

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
        const { userId, subscriptionPlanId, amount, status, currency, startingAt, endingAt } = req.body;

        try {
                if (!userId || amount === undefined || !currency || !status || !startingAt || !endingAt) {
                    return res.status(400).json({ message: 'Please provide required parameters' });
                }

               
                if (typeof startingAt !== 'string' || typeof endingAt !== 'string') {
                    return res.status(400).json({ message: 'Please provide startingAt and endingAt as strings' });
                }

                const tareheStart = new Date(startingAt);
                const tareheEnd = new Date(endingAt);

                const transactionData : any = {
                    amount,
                    currency,
                    status, // Update status after payment confirmation
                    user: { connect: { id: userId } },
                    startingAt: tareheStart,
                    endingAt: tareheEnd,
                };

                // Conditionally add subscriptionPlan if subscriptionPlanId exists
                if (subscriptionPlanId) {
                    transactionData.subscriptionPlan = { connect: { id: subscriptionPlanId } };
                }

                try {
                    const transaction = await prisma.transaction.create({
                        data: transactionData,
                    });
                    return res.status(201).json(transaction);
                } catch (error) {
                    return res.status(500).json({ message: 'Transaction creation failed', error });
                }

        } catch (error) {
            res.status(500).json({ error: 'Error creating transaction' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}