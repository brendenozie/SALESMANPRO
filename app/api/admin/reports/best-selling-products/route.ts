import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
// app/api/admin/reports/best-selling-products/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma'; // Adjust path as needed

export async function GET(req: NextRequest) {
  // --- AUTHENTICATION & AUTHORIZATION PLACEHOLDER ---
  // Only ADMINs or authorized personnel should access reports.
  // --- END PLACEHOLDER ---

  try {
    const { searchParams } = req.nextUrl;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const companyId = searchParams.get('companyId');
    const limit = searchParams.get('limit') || '10';

    if (!startDate || !endDate) {
      return NextResponse.json({ message: 'startDate and endDate are required.' }, { status: 400 });
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // Include the whole end day

    const whereClause: any = {
      createdAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
    };

    // Filter OrderItems by companyId via CustomerOrder
    if (companyId) {
      whereClause.order = {
        companyId: companyId,
      };
    }

    // Aggregate OrderItems by marketplaceListingId to find total quantity sold
    const bestSellingProducts = await prisma.orderItem.groupBy({
      by: ['marketplaceListingId'],
      _sum: {
        quantity: true,
      },
      where: whereClause,
      orderBy: {
        _sum: {
          quantity: 'desc', // Order by highest quantity sold
        },
      },
      take: parseInt(limit), // Take top N products
    });

    // Fetch product names from marketplaceListings
    const listingIds = bestSellingProducts.map(item => item.marketplaceListingId);
    const listings = await prisma.marketplaceListings.findMany({
      where: {
        id: { in: listingIds },
      },
      select: {
        id: true,
        name: true, // Get the product name from the listing
      },
    });

    const listingMap = new Map(listings.map(listing => [listing.id, listing.name || 'Unknown Product']));

    const formattedProducts = bestSellingProducts.map(item => ({
      name: listingMap.get(item.marketplaceListingId) || 'Unknown Product',
      totalSold: item._sum.quantity || 0,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching best-selling products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch best-selling products', error: "error.message" },
      { status: 500 }
    );
  }
}
