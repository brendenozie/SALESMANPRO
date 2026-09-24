import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Authentication required to access property dashboard" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    // Resolve company by slug or fallback
    let company = null;
    if (slug) {
      company = await prisma.company.findFirst({
        where: {
          OR: [{ slug }, { id: /^[0-9a-fA-F]{24}$/.test(slug) ? slug : undefined }],
        },
        select: { id: true, name: true, slug: true },
      });
    }

    // 1. Fetch User Profile
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { email: userEmail }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
      },
    });

    const activeUserId = user?.id || userId;
    const activeEmail = user?.email || userEmail;

    // 2. Fetch Saved Properties (Wishlist)
    const wishlists = await prisma.wishlist.findMany({
      where: { userId: activeUserId },
      include: {
        WishlistItem: {
          include: {
            marketplaceListings: {
              include: {
                myLocation: true,
              },
            },
          },
        },
      },
    });

    const savedProperties = wishlists
      .flatMap((w) => w.WishlistItem || [])
      .filter((item) => item.marketplaceListings)
      .map((item) => {
        const l = item.marketplaceListings!;
        return {
          id: l.id,
          wishlistItemId: item.id,
          title: l.name,
          address: l.locationName || l.myLocation?.name || "Nairobi, Kenya",
          price: l.finalPrice || l.sellingPrice || 0,
          status: l.status === "ACTIVE" ? "Active" : l.status,
          area: l.area ? Number(l.area) : 1200,
          bedrooms: l.bedrooms?.length || 2,
          bathrooms: Number(l.bathrooms) || 2,
          images: (l.images as string[])?.length > 0 ? l.images : ["/placeholder-property.jpg"],
          addedAt: item.addedAt,
        };
      });

    // 3. Fetch Inquiries
    const inquiries = await prisma.inquiry.findMany({
      where: {
        OR: [
          { consumer: { userId: activeUserId } },
          { clientEmail: activeEmail },
        ],
        ...(company?.id ? { companyId: company.id } : {}),
      },
      orderBy: { receivedAt: "desc" },
    });

    // 4. Fetch Showings
    const showings = await prisma.showing.findMany({
      where: {
        OR: [
          { clientId: activeUserId },
          { consumer: { userId: activeUserId } },
        ],
        ...(company?.id ? { companyId: company.id } : {}),
      },
      include: {
        agent: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { dateTime: "asc" },
    });

    // 5. Fetch Offers
    const offers = await prisma.offerContract.findMany({
      where: {
        clientId: activeUserId,
        ...(company?.id ? { companyId: company.id } : {}),
      },
      include: {
        property: { select: { id: true, name: true, images: true } },
        agent: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { offerDate: "desc" },
    });

    // 6. Fetch Bookings (Short-term stays)
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { clientId: activeUserId },
          { consumer: { userId: activeUserId } },
        ],
        bookingType: "ACCOMMODATION_BOOKING",
      },
      orderBy: { startDate: "desc" },
    });

    // 7. Fetch Long-Term Tenancies / Allocations
    const tenancies = await prisma.hostelAllocation.findMany({
      where: {
        hostelMember: {
          OR: [
            { consumer: { userId: activeUserId } },
            { student: { userId: activeUserId } },
          ],
        },
      },
      include: {
        room: {
          include: {
            block: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    // 8. Fetch Maintenance Requests
    const maintenanceRequests = await prisma.hostelMaintenanceRequest.findMany({
      where: {
        reportedBy: activeUserId,
      },
      include: {
        room: {
          include: {
            block: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 9. Fetch Fee Invoices
    const invoices = await prisma.hostelFee.findMany({
      where: {
        hostelMember: {
          consumer: { userId: activeUserId },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    // 10. Compute Summary Statistics
    const stats = {
      savedHomes: savedProperties.length,
      openInquiries: inquiries.filter((i) => i.status !== "Archived").length,
      upcomingTours: showings.filter((s) => s.status === "Scheduled" || s.status === "Confirmed").length,
      activeOffers: offers.filter((o) => o.status === "Pending").length,
      activeBookings: bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING").length,
      activeTenancies: tenancies.filter((t) => t.status === "ACTIVE").length,
      openMaintenance: maintenanceRequests.filter((m) => m.status === "PENDING" || m.status === "IN_PROGRESS").length,
      pendingInvoices: invoices.filter((f) => f.status === "PENDING" || f.status === "OVERDUE").length,
    };

    return NextResponse.json({
      success: true,
      user: {
        id: activeUserId,
        name: user?.name || "Client Member",
        email: activeEmail,
        avatar: user?.image || null,
        phone: user?.phone || null,
        role: user?.role || "CONSUMER",
      },
      stats,
      savedProperties,
      inquiries,
      showings,
      offers,
      bookings,
      tenancies,
      maintenanceRequests,
      invoices,
    });
  } catch (error: any) {
    console.error("[PROPERTIES_DASHBOARD_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load property dashboard data", details: error?.message },
      { status: 500 }
    );
  }
}
