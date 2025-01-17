import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page } = req.query;
  if (req.method === "GET") {

    // const users = await prisma.user.findMany();
    // res.json(users);


    let currentPage = page as unknown as number;
    let skip = currentPage >0  ? currentPage *20 : 0;
    
    const results = await prisma.$transaction([
      prisma.user.count({
        skip : skip,
        take: 20,
      }),
      prisma.user.findMany({
        skip : skip,
        take: 20,
      }),
    ]);

    res.json({InfoResponse:{count: results[0] ?? 0,
                  next: currentPage * 20 > results[0] ? currentPage : 0 ,
                  pages: results[0]/20 > 0 ? results[0]/20 : 1 ,
                  prev: currentPage-1 > 0 ? currentPage-1 : 0},
              results: results[1]
            });
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}
