import { NextApiRequest, NextApiResponse } from 'next'
import prisma, { client } from "@/server/db/prismadb";
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
   const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const amaId = req.query.id as string
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
