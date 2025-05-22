import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = "0", companyId } = req.query;

  if (!companyId || typeof companyId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid `companyId` query parameter.' });
  }

  if (req.method === "GET") {
    const currentPage = parseInt(page as string, 10) || 0;
    const skip = currentPage > 0 ? currentPage * 20 : 0;

    // Define filter: only categories linked to this company
    const whereFilter = {
      companyId: companyId
    };

    // Run count and paginated query in a transaction
    const [totalCount, categories] = await prisma.$transaction([
      prisma.storeCategory.count({ where: whereFilter }),
      prisma.storeCategory.findMany({
        where: whereFilter,
        skip,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              icon: true,
              allBrands: true,
              tags: true,
              subcategories : true,
            }
          }
        },
        take: 20,
        orderBy: { sortOrder: 'asc' }
      }),
    ]);

    const totalPages = Math.ceil(totalCount / 20);
    const nextPage = currentPage + 1 < totalPages ? currentPage + 1 : null;
    const prevPage = currentPage > 0 ? currentPage - 1 : null;

    console.log(categories);

    return res.status(200).json({
      InfoResponse: {
        count: totalCount,
        next: nextPage,
        prev: prevPage,
        pages: totalPages,
      },
      results: categories,
    });
  } else {
    res.setHeader('Allow', ['GET']);
    return res
      .status(405)
      .json({ error: `The HTTP ${req.method} method is not supported at this route.` });
  }
}
