import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function GET( req : Request ) {

  // const { page = "0", companyId } = req.query;
  const { searchParams } = new URL(req.url);

  const companyId = searchParams.get("companyId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const page = parseInt(searchParams.get("page") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }


  if (!companyId || typeof companyId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid `companyId` query parameter.' });
  }

  if (req.method === "GET") {
    const currentPage = page;
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

    return NextResponse.json({
      InfoResponse: {
        count: totalCount,
        next: nextPage,
        prev: prevPage,
        pages: totalPages,
      },
      results: categories,
    });
  } else {
    // res.setHeader('Allow', ['GET']);
    return NextResponse
      .json({ error: `The HTTP ${req.method} method is not supported at this route.` });
  }
}
