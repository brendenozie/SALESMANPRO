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
      OR: [
        { companyId: company.id },
        { items: { some: { marketplaceListing: { companyId: company.id } } } },
      ],
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

  // Fetch transport drivers for this company
  const transportDrivers = await prisma.transportDriver.findMany({
    where: { companyId: company.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Also fetch any staff members assigned to driver or transport roles
  const staffDrivers = await prisma.user.findMany({
    where: {
      companyId: company.id,
      OR: [
        { role: { in: ["STORE_DRIVER", "SCHOOL_DRIVER", "RIDER"] } },
        { staffProfile: { jobTitle: { contains: "driver", mode: "insensitive" } } },
        { staffProfile: { department: { contains: "transport", mode: "insensitive" } } },
      ],
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
    },
  });

  // Deduplicate drivers into a clean list for the driver picker
  const driverMap = new Map<string, { id: string; name: string; phone?: string; role?: string }>();
  for (const td of transportDrivers) {
    const name = td.user?.name || td.licenseNo || "Driver";
    const phone = td.user?.phone || undefined;
    driverMap.set(td.id, { id: td.id, name, phone, role: "Driver" });
  }
  for (const sd of staffDrivers) {
    if (sd.id && !driverMap.has(sd.id)) {
      driverMap.set(sd.id, {
        id: sd.id,
        name: sd.name || "Staff Driver",
        phone: sd.phone || undefined,
        role: sd.role || "Driver Staff",
      });
    }
  }
  const driversList = Array.from(driverMap.values());

  // Format order with serializable dates for client component
  const serializedOrder = {
    ...order,
    companyId: order.companyId || company.id,
    totalPrice: Number(order.totalPrice ?? 0),
    totalFinalPrice: Number(order.totalFinalPrice ?? order.totalPrice ?? 0),
    totalDiscount: Number(order.totalDiscount ?? 0),
    totalTax: Number(order.totalTax ?? 0),
    totalShipping: Number(order.totalShipping ?? 0),
    deliveryFee: Number(order.deliveryFee ?? 0),
    createdAt: order.createdAt ? (typeof order.createdAt === "string" ? order.createdAt : order.createdAt.toISOString()) : new Date().toISOString(),
    updatedAt: order.updatedAt ? (typeof order.updatedAt === "string" ? order.updatedAt : order.updatedAt.toISOString()) : new Date().toISOString(),
    estimatedArrival: order.estimatedArrival ? (typeof order.estimatedArrival === "string" ? order.estimatedArrival : order.estimatedArrival.toISOString()) : null,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price ?? 0),
      totalPrice: Number(item.totalPrice ?? 0),
      date: item.date ? String(item.date) : null,
      createdAt: item.createdAt ? (typeof item.createdAt === "string" ? item.createdAt : item.createdAt.toISOString()) : new Date().toISOString(),
      updatedAt: item.updatedAt ? (typeof item.updatedAt === "string" ? item.updatedAt : item.updatedAt.toISOString()) : new Date().toISOString(),
      marketplaceListing: item.marketplaceListing
        ? {
            id: item.marketplaceListing.id,
            name: item.marketplaceListing.name,
            images: item.marketplaceListing.images,
            finalPrice: item.marketplaceListing.finalPrice !== null && item.marketplaceListing.finalPrice !== undefined
              ? Number(item.marketplaceListing.finalPrice)
              : null,
          }
        : null,
    })),
  };

  return (
    <OrderDetailClient
      order={serializedOrder as any}
      slug={slug}
      companyName={company.name || "Store"}
      companyPhone={company.phone || undefined}
      companyAddress={company.address || undefined}
      drivers={driversList}
    />
  );
}
