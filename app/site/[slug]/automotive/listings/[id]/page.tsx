import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/server/db/prismadb";
import AutoDetailsClient from "./AutoDetailsClient";
import { SEOService } from "@/lib/seo";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string; slug?: string }> | { id: string; slug?: string };
}

// 1. Optimized SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = (params as any) instanceof Promise ? await params : params;
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: resolved.id },
    select: {
      id: true,
      name: true,
      description: true,
      make: true,
      model: true,
      finalPrice: true,
      sellingPrice: true,
      images: true,
      transmission: true,
      fuelType: true,
      mileage: true,
    },
  });

  if (!listing) return { title: "Vehicle Not Found | Auto Deals" };

  const seoResult = SEOService.generate({
    siteType: "GHUBA",
    pageType: "VEHICLE",
    entity: listing,
    currentPath: `/automotive/listings/${resolved.id}`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Autos", url: "/automotive" },
      { name: listing.name, url: `/automotive/listings/${resolved.id}` },
    ],
  });

  return seoResult.metadata;
}

export default async function ListingPage({ params }: PageProps) {
  const resolved = (params as any) instanceof Promise ? await params : params;

  // Fetch everything including nested location and subCategory
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: resolved.id },
  });

  if (!listing) return notFound();

  const seoResult = SEOService.generate({
    siteType: "GHUBA",
    pageType: "VEHICLE",
    entity: listing,
    currentPath: `/automotive/listings/${resolved.id}`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Autos", url: "/automotive" },
      { name: listing.name, url: `/automotive/listings/${resolved.id}` },
    ],
  });

  // 3. Robust Serialization
  const serializedListing = {
    ...listing,
    createdAt: listing.createdAt?.toISOString(),
    updatedAt: listing.updatedAt?.toISOString(),
    finalPrice: Number(listing.finalPrice || 0),
    sellingPrice: Number(listing.sellingPrice || 0),
    buyingPrice: Number(listing.buyingPrice || 0),
    quantity: Number(listing.quantity || 0),
    discount: Number(listing.discount || 0),
    images: listing.images || [],
    location: listing.location && typeof listing.location === "object"
      ? {
          ...(listing.location as Record<string, unknown>),
          createdAt:
            typeof (listing.location as { createdAt?: unknown }).createdAt === "object"
              ? ((listing.location as { createdAt?: Date }).createdAt?.toISOString() ?? null)
              : (listing.location as { createdAt?: unknown }).createdAt,
        }
      : null,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoResult.jsonLd) }}
      />
      <AutoDetailsClient data={serializedListing} />
    </>
  );
}