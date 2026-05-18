import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/server/db/prismadb";
import TravelDestinationView from "./PropertyDetailsClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: params.id },
    select: { name: true, description: true, images: true },
  });

  if (!listing) return { title: "Property Not Found" };

  const images: string[] = Array.isArray(listing.images)
    ? listing.images
        .map((img: any) => typeof img === "string" ? img : img?.url)
        .filter((src): src is string => typeof src === "string")
    : [];

  return {
    title: `${listing.name} | Premium Experience`,
    description: listing.description?.slice(0, 160) || "Explore this exclusive listing.",
    openGraph: {
      title: listing.name,
      description: listing.description?.slice(0, 160),
      images: images.length ? [{ url: images[0] }] : undefined,
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const listing = await prisma.marketplaceListings.findUnique({
    where: { id: params.id },
  });

  if (!listing) return notFound();

  // Bulletproof BigInt / Decimal serialization for Next.js Client Components
  const serializedListing = {
    ...listing,
    finalPrice: Number(listing.finalPrice || 0),
    sellingPrice: Number(listing.sellingPrice || 0),
    buyingPrice: Number(listing.buyingPrice || 0),
    quantity: listing.quantity ? String(listing.quantity) : "0",
    createdAt: listing.createdAt instanceof Date ? listing.createdAt.toISOString() : null,
    updatedAt: listing.updatedAt instanceof Date ? listing.updatedAt.toISOString() : null,
  };

  return <TravelDestinationView product={serializedListing} company={null} />;
}