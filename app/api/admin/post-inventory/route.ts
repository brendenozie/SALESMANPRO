import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


// POST /api/post
 async function handleGET( req : Request ) {
  // const { wiDate,
  //   wiAmount,
  //   userId
  // } = req.body;

  // if (!wiAmount || !wiDate|| !userId) {
  //   return NextResponse.json({ message: 'Please provide fromDate and toDate query parameters' });
  // }

  // if (typeof wiDate !== 'string') {
  //   return NextResponse.json({ message: 'Please provide fromDate and toDate as strings' });
  // }

  // const tarehe = new Date(wiDate);
  // const wi_amount = parseFloat(wiAmount);

  // if (isNaN(tarehe.getTime())) {
  //   return NextResponse.json({ message: 'Invalid date format provided' });
  // }

  // const result = await prisma.waterIntakeProgress.create({
  //   data: {
  //     date:tarehe,
  //     dailyIntake:wi_amount,
  //     userId
  //   },
  // });
  // res.json(result);

    return formatResponse(true, null, "GET request received.", 200);
  
}

export const GET = withApiHandler(handleGET);