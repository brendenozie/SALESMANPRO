import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";


export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" });
  }

  try {
    // const topAgent = await prisma.salesAgent.findFirst({
    //   orderBy: { totalSales: "desc" },
    //   select: { name: true, totalSales: true },
    // });

    // res.status(200).json({
    //   topAgent: topAgent?.name || "N/A",
    //   topAgentSales: topAgent?.totalSales || 0,
    // });
  } catch (error) {
    console.error(error);
    NextResponse.json({ message: "Internal server error" });
  }
}
