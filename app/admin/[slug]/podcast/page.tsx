import React from "react";
import PodcastsClient from "./PodcastsClient"; // Assuming PodcastsClient is in the same directory
import { IStoreCategory } from "@/types/typings";

import { cookies } from "next/headers";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define the Podcast type
type Podcast = {
  _id: string;
  creatorId: string; // Renamed from sellerId
  creatorType: string; // Renamed from sellerType
  podcastId: string; // Renamed from productId
  title: string;
  companyId:string;
  description: string;
  audioUrl: string; // New field for podcast audio
  duration: number; // New field for podcast duration in seconds
  episodeNumber: number; // New field for episode number
  releaseDate: string; // New field for release date
  categories: string; // Array of category IDs
  tags: string[]; // Array of tag IDs
  coverImageUrl: string; // New field for podcast cover image
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // Removed product-specific fields like quantity, salesPrice, discount, buyingPrice, sellingPrice, isOnOffer, isFlashDeal, isNewArrival, isDiscounted
};

// Define the Tag type for podcasts
type Tag = {
  _id: string; // Changed from id to _id
  name: string;
  slug: string; // Added a slug for friendly URLs
  // Removed image and status as they are not typically direct properties of a podcast tag
};

interface PaginatedPodcasts {
  meta: {
    companyId: string;
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  results: Podcast[];
}

/**
 * This is a **Server Component**. It fetches all the data
 * at request-time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: runs on each request (no-store), fetches podcasts,
 * then renders the PodcastsClient with those props.
 */
export default async function PodcastsAdminPage({ params }: PageProps) {
  const { slug : companyId } = await params; // Using companyId as the slug for now, adjust as needed
  const cookieHeader = (await cookies()).toString();
  let podcastsData: Podcast[] = [];
  let categoriesData: IStoreCategory[] = [];

  try {
    // Fetch podcasts
    const podcastsRes = await fetch(
      `${apiBaseUrl}/admin/podcasts?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );

    if (podcastsRes.ok) {
      const dataRes = await podcastsRes.json();
      console.log("[PodcastsAdminPage] Fetched podcasts data:", dataRes);
      const data = dataRes.data;
      podcastsData = data;
    } else {
      console.error(
        "[PodcastsAdminPage] Failed to fetch podcasts:",
        podcastsRes.status,
        podcastsRes.statusText
      );
    }

    // Fetch all categories relevant to podcasts (might be different from store categories)
    // --- Fetch store categories ---
    const categoriesRes = await fetch(
      `${apiBaseUrl}/admin/get-store-categories?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 } , headers: { cookie: cookieHeader } }
    );

    if (categoriesRes.ok) {
      const json = await categoriesRes.json();
      categoriesData = json.data.results ?? [];
    } else {
      console.error(
        "[ClientInventoryPage] Failed to fetch store categories:",
        categoriesRes.status,
        categoriesRes.statusText
      );
    }

  } catch (err: any) {
    console.error("[PodcastsAdminPage] Error fetching data:", err.message);
  }

  return (
    <PodcastsClient
      companyId={companyId}
      podcastsData={podcastsData}
      categoriesData={categoriesData}
    />
  );
}