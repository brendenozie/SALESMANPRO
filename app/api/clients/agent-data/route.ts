import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
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
    res.status(500).json({ message: "Internal server error" });
  }
}
