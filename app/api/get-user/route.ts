// app/api/users/route.ts (or app/api/users/[page]/route.ts if dynamic)

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function handler(req: Request, res: any) {
  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const page = url.searchParams.get("page") ?? "0";
      const currentPage = parseInt(page, 10) || 0;

      const limit = 20;
      const skip = currentPage > 0 ? currentPage * limit : 0;

      const [count, users] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.findMany({
          skip,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(count / limit);

      return res.status(200).json(
        formatResponse(true, {
          info: {
            count,
            pages: totalPages,
            next: currentPage + 1 < totalPages ? currentPage + 1 : null,
            prev: currentPage > 0 ? currentPage - 1 : null,
          },
          results: users,
        })
      );
    } catch (error: any) {
      return res
        .status(500)
        .json(formatResponse(false, null, error.message || "Internal server error"));
    }
  }

  return res
    .status(405)
    .json(formatResponse(false, null, `Method ${req.method} not allowed`, 405));
}

export const GET = withApiHandler(handler);
