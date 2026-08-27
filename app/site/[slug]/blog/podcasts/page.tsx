import React from "react";
import PodcastsClient from "./PodcastsClient";
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";
import { cookies } from "next/headers";
import { findCompanyCached } from "@/lib/company-fetcher";
import { notFound } from "next/navigation";

export type PodcastEpisode = {
  id: string;
  title: string;
  description: string | null;
  audioUrl: string;
  coverImage: string | null;
  duration: string | null; // e.g., "45:20"
  publishedAt: Date | string | null;
  createdAt: Date | string;
  episodeNumber: number | null;
  seasonNumber: number | null;
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getPodcastEpisodes(page: number, limit: number, companyId: string) {
  const cacheKey = `public:podcasts:all:${companyId}:p-${page}`;
  
  
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
  } catch (e) {}

  const offset = (page - 1) * limit;

  const [results, totalItems] = await Promise.all([
    prisma.podcast.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.podcast.count({
      where: { companyId }
    })
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  const payload = { results, totalItems, totalPages };

  try {
    await cacheSet(cacheKey, payload, 120); // 2 minute transient buffer
  } catch (e) {}

  return payload;
}

export default async function PodcastsPage({  params, searchParams  }: PageProps) {
  const { slug } = await params;
    
    const resolvedSearchParams = await searchParams;
    const cookieHeader = (await cookies()).toString();
  
    const baseCompany = await findCompanyCached(slug, "lean");
      if (!baseCompany) notFound();
    
  
  // Resolve runtime params asynchronously
  const resolvedParams = resolvedSearchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;
  const limit = 12;

  const { results, totalItems, totalPages } = await getPodcastEpisodes(page, limit, baseCompany.id);

  // Parse server datetime stamps cleanly prior to component inheritance hydrate boundaries
  const serializedEpisodes = results.map((ep) => ({
    ...ep,
    publishedAt: ep.publishedAt ? new Date(ep.publishedAt).toISOString() : null,
    createdAt: new Date(ep.createdAt).toISOString(),
  }));

  return (
    <PodcastsClient 
      episodes={serializedEpisodes}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}