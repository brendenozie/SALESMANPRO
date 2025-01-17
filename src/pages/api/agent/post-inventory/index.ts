import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../server/db/prismadb";

// POST /api/post

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { wiDate,
    wiAmount,
    userId
  } = req.body;

  if (!wiAmount || !wiDate|| !userId) {
    return res.status(400).json({ message: 'Please provide fromDate and toDate query parameters' });
  }

  if (typeof wiDate !== 'string') {
    return res.status(400).json({ message: 'Please provide fromDate and toDate as strings' });
  }

  const tarehe = new Date(wiDate);
  const wi_amount = parseFloat(wiAmount);

  if (isNaN(tarehe.getTime())) {
    return res.status(400).json({ message: 'Invalid date format provided' });
  }

  // const result = await prisma.waterIntakeProgress.create({
  //   data: {
  //     date:tarehe,
  //     dailyIntake:wi_amount,
  //     userId
  //   },
  // });
  // res.json(result);
}