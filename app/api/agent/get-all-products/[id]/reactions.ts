import { NextApiRequest, NextApiResponse } from 'next'
import prisma, { client } from "@/server/db/prismadb";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const amaId = req.query.id as string
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
  
  if (req.method === 'PUT') {
    // const ama = await prisma.booking.update({
    //   where: {
    //     id: amaId,
    //   },
    //   data: {
    //     reactions: {
    //       increment: 1,
    //     },
    //   },
    // })
    res.json({ id: "ama?.id", reactions: "ama?.reactions", status: "ama?.status "})
  } else {
    return res.status(404).end()
  }
}
