import { notFound } from "next/navigation";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";
import OrderDetailClient from "./OrderDetailClient";

interface PageProps {
  params: Promise<{
    slug: string;
    orderId: string;
  }>;
}

export default async function OrderDetailPage(props: PageProps) {
  const { slug, orderId } = await props.params;

  const company = await findCompanyCached(slug, "page");
  if (!company) {
    notFound();
  }

  const order = await prisma.customerOrder.findFirst({
    where: {
      id: orderId,
      companyId: company.id,
    },
    include: {
      items: {
        include: {
          marketplaceListing: {
            select: {
              id: true,
              name: true,
              images: true,
              finalPrice: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Format order with serializable dates for client component
  const serializedOrder = {
    ...order,
    totalPrice: Number(order.totalPrice ?? 0),
    totalFinalPrice: Number(order.totalFinalPrice ?? order.totalPrice ?? 0),
    totalDiscount: Number(order.totalDiscount ?? 0),
    totalTax: Number(order.totalTax ?? 0),
    totalShipping: Number(order.totalShipping ?? 0),
    deliveryFee: Number(order.deliveryFee ?? 0),
    createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: order.updatedAt ? order.updatedAt.toISOString() : new Date().toISOString(),
    estimatedArrival: order.estimatedArrival ? order.estimatedArrival.toISOString() : null,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price ?? 0),
      totalPrice: Number(item.totalPrice ?? 0),
      date: item.date ? item.date.toISOString() : null,
      createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : new Date().toISOString(),
    })),
  };

  return (
    <OrderDetailClient
      order={serializedOrder}
      slug={slug}
      companyName={company.name || "Store"}
      companyPhone={company.phone || undefined}
      companyAddress={company.address || undefined}
    />
  );
}
