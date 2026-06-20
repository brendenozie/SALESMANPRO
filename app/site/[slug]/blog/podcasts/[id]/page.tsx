import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";
import PodcastEpisodeClient from "./PodcastEpisodeClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getEpisodeRecord(id: string) {
  const cacheKey = `public:podcast-episode:${id}`;
  
  // 1. Check transient cache ring
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
  } catch (e) {}

  // 2. Fetch from core store
  const episode = await prisma.podcast.findFirst({
    where: { slug:id }
  });

  if (!episode) return null;

  // 3. Populate dynamic cache layer
  try {
    await cacheSet(cacheKey, episode, 300); // 5 minute standard ring TTL
  } catch (e) {}

  return episode;
}

export default async function PodcastEpisodePage({ params }: PageProps) {
  const { id } = await params;
  const episode = await getEpisodeRecord(id);

  if (!episode) {
    notFound();
  }

  // Parse Date time stamps prior to passing context across server-client boundaries
  const serializedEpisode = {
    ...episode,
    publishedAt: episode.publishedAt ? episode.publishedAt.toISOString() : null,
    createdAt: episode.createdAt.toISOString(),
  };

  return <PodcastEpisodeClient episode={serializedEpisode} />;
}