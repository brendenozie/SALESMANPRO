import { NextApiRequest, NextApiResponse } from "next";

import prisma, { client } from "@/server/db/prismadb";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";
import { NextResponse } from "next/server";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const { page, userId } = req.query;
  const { searchParams } = new URL(req.url);
  
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return NextResponse.json(
        { message: "Invalid pagination parameters." },
        { status: 400 }
      );
    }
  
  if (req.method === 'GET') {
        try {
            // const plans = await prisma.subscriptionPlan.findMany();
            // res.status(200).json(plans);
        } catch (error) {
            NextResponse.json({ error: 'Error fetching subscription plans' });
        }
    } else {
        NextResponse.json({ error: 'Method not allowed' });
    }
}
