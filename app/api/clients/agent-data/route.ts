import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed


export default async function GET( req : Request ) {
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
