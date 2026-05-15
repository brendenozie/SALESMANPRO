// app/[slug]/events/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import EventListWrapper from "./components/EventListWrapper/EventListWrapper";

// --- Mock sample events (used when DB has no items yet) ---
const mockEvents = [
  {
    id: "mock-1",
    name: "Agrotech Innovations Summit 2026",
    images: ["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80"],
    date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    timeString: "09:00 AM - 05:00 PM",
    location: "Main Auditorium & Virtual",
    category: "Workshop",
    finalPrice: 1500,
    ticketsAvailable: 50,
    isSoldOut: false,
  },
  {
    id: "mock-2",
    name: "Sustainable Organic Farming Masterclass",
    images: ["https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80"],
    date: new Date(Date.now() + 86400000 * 7).toISOString(), // 1 week from now
    timeString: "11:00 AM - 02:00 PM",
    location: "Online (Zoom Meeting)",
    category: "Academic",
    finalPrice: 0, // Free event
    ticketsAvailable: 200,
    isSoldOut: false,
  },
];

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

export const dynamic = "force-dynamic";

export default async function EventListPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  // Ensure targeted company tenant profile exists
  const company = await prisma.company.findUnique({ where: { slug } });
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

  // Fetch parallel instances from relational database collections
  const [eventRecords, categories] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy,
      take: 30,
      include: {
        productCategory: true,
      },
    }),
    prisma.storeCategory.findMany({
      orderBy: { displayName: "asc" },
      where: { companyId: company.id },
      select: { id: true, displayName: true, categoryId: true, category: true },
    }),
  ]);

  // Transform Prisma output safely to fit the unified frontend UI state contracts
  const normalizedEvents = eventRecords.map((evt) => {
    // Determine dynamic timeline access strings stringify windows cleanly
    const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    const startTimeStr = new Date(evt.startDateTime).toLocaleTimeString("en-US", timeOptions);
    const endTimeStr = evt.endDateTime 
      ? ` - ${new Date(evt.endDateTime).toLocaleTimeString("en-US", timeOptions)}`
      : "";

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
      finalPrice: evt.price || 0,
      isPaid: evt.isPaid,
      ticketsAvailable: evt.maxCapacity !== null ? evt.maxCapacity : 100, // Safe default boundary limit
      isSoldOut: evt.eventStatus === "CANCELLED",
    };
  });

  // Assign mapped data variables cleanly or drop back onto fallbacks
  const events = normalizedEvents.length > 0 ? normalizedEvents : mockEvents;

  // Process operational dynamic dropdown labels matching requirements
  const cats = categories.length
    ? categories.map((c) => ({
        id: c.id,
        displayName: c.displayName,
        categoryId: c.categoryId,
        category: c.category,
      }))
    : [
        { id: "cat_1", displayName: "Workshops", categoryId: "cat_1", category: "Education" },
        { id: "cat_2", displayName: "Conferences", categoryId: "cat_2", category: "Networking" },
        { id: "cat_3", displayName: "Academic Meetings", categoryId: "cat_3", category: "Institutional" },
      ];

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 p-4 sm:p-8 pt-24">
      <EventListWrapper events={events} categories={cats} />
    </div>
  );
}