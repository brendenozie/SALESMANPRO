import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/server/db/prismadb";
import AutoDetailsClient from "./AutoDetailsClient";

export const revalidate = 60;

interface PageProps {
  params: { id: string };
}

// 1. Optimized SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: params.id },
    select: { name: true, description: true, images: true },
  });

  if (!listing) return { title: "Property Not Found" };

  return {
    title: `${listing.name} | Real Estate`,
    description: listing.description?.slice(0, 160),
    openGraph: {
      title: listing.name,
      description: listing.description || "",
      images: Array.isArray(listing.images)
        ? listing.images
            .filter(
              (img): img is string | { url: string } =>
                typeof img === "string" ||
                (typeof img === "object" &&
                  img !== null &&
                  "url" in img &&
                  typeof (img as { url?: unknown }).url === "string")
            )
            .map((img) => (typeof img === "string" ? { url: img } : { url: img.url }))
        : [],
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  // Fetch everything including nested location and subCategory
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: params.id },
  });

  if (!listing) return notFound();

  // 3. Robust Serialization
  // We explicitly map fields that MongoDB/Prisma handles as complex types
  const serializedListing = {
    ...listing,
    // Convert Dates to ISO Strings
    createdAt: listing.createdAt?.toISOString(),
    updatedAt: listing.updatedAt?.toISOString(),
    
    // Ensure Numbers (Handling $numberLong and Decimals)
    finalPrice: Number(listing.finalPrice || 0),
    sellingPrice: Number(listing.sellingPrice || 0),
    buyingPrice: Number(listing.buyingPrice || 0),
    quantity: Number(listing.quantity || 0),
    discount: Number(listing.discount || 0),
    
    // Pass arrays directly (Next.js serializes simple arrays/objects automatically)
    bedrooms: listing.bedrooms || [],
    studios: listing.studios || [],
    amenities: listing.amenities || [],
    images: listing.images || [],
    
    // Ensure nested objects are handled
    location: listing.location && typeof listing.location === 'object'
      ? {
          ...(listing.location as Record<string, unknown>),
          // If location has its own dates, serialize them too
          createdAt:
            typeof (listing.location as { createdAt?: unknown }).createdAt === 'object'
              ? ((listing.location as { createdAt?: Date }).createdAt?.toISOString() ?? null)
              : (listing.location as { createdAt?: unknown }).createdAt,
        }
      : null,
  };

  return <AutoDetailsClient data={serializedListing} />;
}