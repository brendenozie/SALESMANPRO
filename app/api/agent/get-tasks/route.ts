import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {

     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { page } = req.query;
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
