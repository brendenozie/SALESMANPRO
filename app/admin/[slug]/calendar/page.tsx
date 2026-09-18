import React from "react";
import AdminAppointmentsClient, { AppointmentItem, OrderItem } from "./AdminAppointementsClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AppointmentsPage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Safely resolve company
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500">
        Company not found
      </div>
    );
  }

  const companyId = company.id;

  // 2. Fetch live customer order items that have service scheduling (date/timeSlot) or are part of SERVICE orders
  let liveOrderItems: OrderItem[] = [];
  try {
    const ordersWithItems = await prisma.customerOrder.findMany({
      where: {
        companyId,
        OR: [
          { orderType: "SERVICE" },
          { items: { some: { date: { not: null } } } },
          { items: { some: { timeSlot: { not: null } } } },
        ],
      },
      include: {
        items: {
          include: {
            marketplaceListing: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    for (const order of ordersWithItems) {
      for (const item of order.items) {
        // Only include items with scheduled dates, or fallback to order creation date for service items
        const itemDate = item.date 
          ? item.date.toISOString().split("T")[0] 
          : order.deliveryDate 
            ? order.deliveryDate.toISOString().split("T")[0]
            : order.createdAt.toISOString().split("T")[0];

        const itemTimeSlot = item.timeSlot || order.deliveryTimeSlot || "10:00 AM";

        liveOrderItems.push({
          id: item.id,
          price: Number(item.totalPrice ?? item.price ?? 0),
          name: item.marketplaceListing?.name || item.serviceNotes || "Service Order",
          email: order.email || undefined,
          phone: order.phone || undefined,
          quantity: item.quantity,
          status: order.status,
          date: itemDate,
          timeSlot: itemTimeSlot,
          marketplaceListing: {
            id: item.marketplaceListing?.id,
            name: item.marketplaceListing?.name || item.serviceNotes || "Service",
            title: item.marketplaceListing?.name,
          },
          order: {
            id: order.id,
            status: order.status,
            rider: order.deliveryPersonName || (order as any).riderId || undefined,
            createdAt: order.createdAt.toISOString(),
            name: order.name || "Customer",
            email: order.email || undefined,
            phone: order.phone || undefined,
            consumer: {
              name: order.name || undefined,
              email: order.email || undefined,
              phone: order.phone || undefined,
            },
          },
        });
      }
    }
  } catch (err: any) {
    console.error("[CalendarPage] Error querying live customer orders:", err);
  }

  // If no live order items exist yet, provide helpful initial placeholder data
  const fallbackAppointments: AppointmentItem[] = liveOrderItems.length === 0 ? [
    {
      id: "apt_welcome_1",
      service: "Consultation & Service Checkup",
      date: new Date().toISOString().split("T")[0],
      timeSlot: "11:00 AM",
      client: {
        name: "Welcome Client",
        email: "client@example.com",
        phone: "+254 700 000 000",
      },
      status: "Scheduled",
      notes: "Sample service appointment. Book new services in Service POS to see them appear live.",
    },
  ] : [];

  return (
    <AdminAppointmentsClient 
      initialAppointments={fallbackAppointments} 
      initialOrderItems={liveOrderItems} 
    />
  );
}