import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import prisma, { client } from "../../../../server/db/prismadb";

// POST /api/post

export default async function GET( req : Request ) {
  if (req.method === 'POST') {
        const { userId, subscriptionPlanId, amount, status, currency, startingAt, endingAt } = req.body;

        try {
                if (!userId || amount === undefined || !currency || !status || !startingAt || !endingAt) {
                    return NextResponse.json({ message: 'Please provide required parameters' });
                }

               
                if (typeof startingAt !== 'string' || typeof endingAt !== 'string') {
                    return NextResponse.json({ message: 'Please provide startingAt and endingAt as strings' });
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
                    // const transaction = await prisma.transaction.create({
                    //     data: transactionData,
                    // });
                    // return res.status(201).json(transaction);
                } catch (error) {
                    return NextResponse.json({ message: 'Transaction creation failed', error });
                }

        } catch (error) {
            NextResponse.json({ error: 'Error creating transaction' });
        }
    } else {
        NextResponse.json({ error: 'Method not allowed' });
    }
}