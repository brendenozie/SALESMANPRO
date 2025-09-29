// app/api/shop/categories/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/server/db/prismadb'
import { formatResponse } from "@/lib/formatResponse";


export async function GET(request: Request) {
  try {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '12', 10)

    const skip = (page - 1) * limit
    const take = limit

    const [categories, total] = await Promise.all([
      prisma.productCategory.findMany({ skip, take }),
      prisma.productCategory.count()
    ])

    return NextResponse.json({
      categories,
      totalPages: Math.ceil(total / take),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch product categories' },
      { status: 500 }
    )
  }
}
