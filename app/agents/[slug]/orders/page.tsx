import React from "react";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import AgentOrdersClient from "./AgentOrdersClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentOrdersPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "orders");

  const companyId = context.company.id;

  const orders = await prisma.customerOrder.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      totalPrice: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  const formattedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    totalPrice: o.totalPrice,
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <AgentOrdersClient
      slug={slug}
      currency={context.company.currency}
      initialOrders={formattedOrders}
    />
  );
}
