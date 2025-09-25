// app/api/blogs/route.ts

import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";  // adjust path if needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

export async function GET(req: Request) {
  
     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { searchParams } = new URL(req.url);


  // pagination & filtering params
  const companyId = searchParams.get("companyId");
  const limit     = parseInt(searchParams.get("limit") || "10", 10);
  const page      = parseInt(searchParams.get("page")  || "1",  10);
  const offset    = (page - 1) * limit;

  // validate
  if (!companyId) {
    return NextResponse.json(
      { message: "Missing required query parameter: companyId." },
      { status: 400 }
    );
  }
  if (isNaN(limit) || limit <= 0 || isNaN(page) || page <= 0) {
    return NextResponse.json(
      { message: "'limit' and 'page' must be positive integers." },
      { status: 400 }
    );
  }

  try {
    // total count for UI
    const totalItems = await prisma.blog.count({
      where: { companyId }
    });

    // fetch paginated slice (showing published first, fallback to createdAt)
    const results = await prisma.blog.findMany({
      where: { companyId },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt:   "desc" },
      ],
      skip:   offset,
      take:   limit,
      include: {
        seo: true,
        // you could include comments count or author if desired
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      meta: {
        companyId,
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
      results,
    });
  } catch (error: any) {
    console.error("❌ Error fetching blogs:", error);
    return NextResponse.json(
      {
        message: "An error occurred while fetching blogs.",
        error:   error.message,
      },
      { status: 500 }
    );
  }
}
