import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const company = await prisma.company.findFirst({
      where: {
        OR: [{ slug }, { domain: slug }],
      },
      select: { id: true, name: true, currency: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Find consumer record
    const consumer = await prisma.consumer.findFirst({
      where: {
        companyId: company.id,
        OR: [
          { userId },
          ...(userEmail ? [{ email: userEmail }] : []),
        ],
      },
      include: {
        addresses: true,
      },
    });

    // Query all deliveries for this user
    const deliveries = await prisma.delivery.findMany({
      where: {
        companyId: company.id,
        OR: [
          ...(consumer ? [{ consumerId: consumer.id }] : []),
          ...(userEmail ? [{ customerEmail: userEmail }] : []),
          {
            CustomerOrders: {
              some: {
                OR: [
                  { userId },
                  ...(consumer ? [{ consumerId: consumer.id }] : []),
                  ...(userEmail ? [{ email: userEmail }] : []),
                ],
              },
            },
          },
        ],
      },
      include: {
        CustomerOrders: {
          select: {
            id: true,
            totalPrice: true,
            status: true,
            paymentOption: true,
          },
        },
        rider: {
          select: {
            name: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            model: true,
            registration: true,
          },
        },
        tracking: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
        proofs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const activeStatuses = [
      "REQUESTED",
      "QUOTED",
      "PENDING_PAYMENT",
      "CONFIRMED",
      "SCHEDULED",
      "DRIVER_ASSIGNED",
      "DRIVER_EN_ROUTE_TO_PICKUP",
      "ARRIVED_AT_PICKUP",
      "PICKED_UP",
      "IN_TRANSIT",
      "ARRIVED_AT_DESTINATION",
      "OUT_FOR_DELIVERY",
    ];

    const activeDeliveries = deliveries.filter((d) => activeStatuses.includes(d.status));
    const completedDeliveries = deliveries.filter((d) => !activeStatuses.includes(d.status));

    const totalSpent = deliveries.reduce((acc, curr) => acc + (curr.totalAmount || curr.deliveryFee || 0), 0);

    return NextResponse.json({
      success: true,
      currency: company.currency || "USD",
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      stats: {
        activeCount: activeDeliveries.length,
        completedCount: completedDeliveries.length,
        totalDeliveries: deliveries.length,
        totalSpent,
      },
      activeDeliveries: activeDeliveries.map((d) => ({
        id: d.id,
        trackingNumber: d.trackingNumber,
        status: d.status,
        pickupAddress: d.pickupAddress,
        deliveryAddress: d.deliveryAddress,
        packageDescription: d.packageDescription,
        packageWeightKg: d.packageWeightKg || d.weightKg,
        fee: d.totalAmount || d.deliveryFee,
        scheduledFor: d.scheduledFor,
        createdAt: d.createdAt,
        driver: d.rider?.name || null,
        vehicle: d.vehicle?.registration || null,
        latestTracking: d.tracking?.[0] || null,
        orderNumber: d.CustomerOrders?.[0]?.id || null,
      })),
      completedDeliveries: completedDeliveries.map((d) => ({
        id: d.id,
        trackingNumber: d.trackingNumber,
        status: d.status,
        pickupAddress: d.pickupAddress,
        deliveryAddress: d.deliveryAddress,
        packageDescription: d.packageDescription,
        fee: d.totalAmount || d.deliveryFee,
        deliveredAt: d.scheduledFor || d.createdAt,
        hasProof: d.proofs.length > 0,
        proofRecipient: d.proofs[0]?.recipientName || null,
        proofSignatureUrl: d.proofs[0]?.signatureUrl || null,
      })),
      savedAddresses: consumer?.addresses || [],
    });
  } catch (error: any) {
    console.error("Error fetching customer logistics data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load customer profile" },
      { status: 500 }
    );
  }
}
