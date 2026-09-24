// app/[slug]/events/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import EventListWrapper from "./components/EventListWrapper/EventListWrapper";
import { findCompanyCached } from "@/lib/company-fetcher";
import { fetchWithCache, buildTenantCacheKey } from "@/lib/cache";



interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: string; // upcoming | past | live | all
  }>;
}

export const revalidate = 60;

export default async function EventListPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  // Ensure targeted company tenant profile exists
  const company = await findCompanyCached(slug, "lean");
  if (!company) notFound();

  // Extract parameters sent from current navigation status state
  const search = searchParamsResolved.search || "";
  const categoryId = searchParamsResolved.category || null;
  const sort = searchParamsResolved.sort || "date-asc";
  const minPrice = parseFloat(searchParamsResolved.minPrice || "0");
  const maxPrice = parseFloat(searchParamsResolved.maxPrice || "100000");
  const status = searchParamsResolved.status || "upcoming";

  // Build Prisma query condition block tailored for Event models
  const where: any = { companyId: company.id };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    where.productCategoryId = categoryId;
  }

  // Handle Event chronological windows safely
  const now = new Date();
  if (status === "upcoming") {
    where.startDateTime = { gte: now };
    // where.eventStatus = "SCHEDULED";
  } else if (status === "past") {
    where.startDateTime = { lt: now };
  } else if (status === "live") {
    where.startDateTime = { lte: now };
    where.endDateTime = { gte: now };
  }

  // Cost/Payment filter evaluation 
  if (minPrice || maxPrice) {
    where.price = { gte: minPrice, lte: maxPrice };
  }

  // Build relational sort sequence criteria configuration mapping
  let orderBy: any = { startDateTime: "asc" }; // Default: Show soonest chronological events first
  if (sort === "date-desc") orderBy = { startDateTime: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };

  // Fetch parallel instances with singleflight caching
  const eventsCacheKey = buildTenantCacheKey(company.id, "events_catalog", {
    search,
    categoryId: categoryId || "all",
    status,
    sort,
    minPrice,
    maxPrice,
  });

  const { eventRecords, categories } = await fetchWithCache(
    eventsCacheKey,
    async () => {
      const [eventRecords, categories] = await Promise.all([
        prisma.event.findMany({
          where,
          orderBy,
          take: 50,
          include: {
            productCategory: true,
            tickets: {
              where: { isActive: true },
            },
          },
        }),
        prisma.storeCategory.findMany({
          orderBy: { displayName: "asc" },
          where: { companyId: company.id },
          select: { id: true, displayName: true, categoryId: true, category: true },
        }),
      ]);
      return { eventRecords, categories };
    },
    180
  );

  // Transform Prisma output safely to fit the unified frontend UI state contracts
  const normalizedEvents = eventRecords.map((evt: any) => {
    const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    const startTimeStr = new Date(evt.startDateTime).toLocaleTimeString("en-US", timeOptions);
    const endTimeStr = evt.endDateTime 
      ? ` - ${new Date(evt.endDateTime).toLocaleTimeString("en-US", timeOptions)}`
      : "";

    // Compute ticket pricing and real inventory
    const activeTickets = evt.tickets || [];
    let calculatedRemaining = evt.maxCapacity !== null ? evt.maxCapacity : 100;
    let lowestPrice = evt.price || 0;

    if (activeTickets.length > 0) {
      calculatedRemaining = activeTickets.reduce(
        (sum: number, t: any) => sum + Math.max(0, t.quantityTotal - t.quantitySold),
        0
      );
      lowestPrice = Math.min(...activeTickets.map((t: any) => t.price));
    }

    const isSoldOut = evt.eventStatus === "CANCELLED" || (activeTickets.length > 0 && calculatedRemaining <= 0);

    return {
      id: evt.id,
      name: evt.title,
      summary: evt.summary || "",
      description: evt.description || "",
      images: evt.imageUrl ? [evt.imageUrl] : [],
      date: evt.startDateTime.toISOString(),
      timeString: `${startTimeStr}${endTimeStr}`,
      location: evt.location || "Online / Virtual Venue",
      category: evt.category || evt.productCategory?.name || "General",
      finalPrice: lowestPrice,
      isPaid: lowestPrice > 0,
      ticketsAvailable: calculatedRemaining,
      isSoldOut,
      tickets: activeTickets,
    };
  });

  const events = normalizedEvents;

  const cats = categories.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    categoryId: c.categoryId,
    category: c.category,
  }));

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 p-4 sm:p-8 pt-24">
      <EventListWrapper events={events} categories={cats} />
    </div>
  );
}