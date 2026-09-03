import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/server/db/prismadb";
import PropertyDetailsClient from "./PropertyDetailsClient";

export const revalidate = 60;

interface PageProps {
  params: { id: string };
}

// 1. Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: params.id },
    select: { name: true, description: true, images: true },
  });

  if (!listing) return { title: "Property Not Found" };

  // Ensure images are strings suitable for openGraph.images (OGImage | OGImage[])
  const images: string[] = Array.isArray(listing.images)
    ? listing.images.filter((img): img is string => typeof img === "string")
    : [];

  return {
    title: listing.name,
    description: listing.description?.slice(0, 160),
    openGraph: {
      images: images.length ? images : undefined,
    },
  };
}

// 2. Main Page Component
export default async function ListingPage({ params }: PageProps) {
  // Fetch Listing + Seller Info
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: params.id },
    // include: {
      // seller: {
      //   select: {
      //     name: true,
      //     image: true,
      //     email: true,
      //     phoneNumber: true,
      //   },
      // },
    // },
  });

  if (!listing) return notFound();

  // 3. Serialize Data (Convert Decimals to Numbers/Strings for Client)
  const serializedListing = {
    ...listing,
    finalPrice: Number(listing.finalPrice || 0),
    sellingPrice: Number(listing.sellingPrice || 0),
    buyingPrice: Number(listing.buyingPrice || 0),
    createdAt: listing.createdAt?.toISOString(),
    updatedAt: listing.updatedAt?.toISOString(),
  };

  return <PropertyDetailsClient data={serializedListing} />;
}