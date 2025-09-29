import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import { formatResponse } from "@/lib/formatResponse";
import { request } from "http";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const {hotelId, userEmail} = req.body;
  if (req.method === "DELETE") {
    // const hotel = await prisma.hotel.delete({
    //   where: { hotelId_userEmail: { hotelId: hotelId as string, userEmail: userEmail as string } },
    // });
    res.json(`The HTTP ${req.method} method is not supported at this route.`);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}
