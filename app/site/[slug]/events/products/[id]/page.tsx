import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { StoreForm, IEvent } from '@/types/typings';
import EventDetailClient from './EventDetailClient';
import { findCompanyCached } from '@/lib/company-fetcher';
import { fetchWithCache, buildTenantCacheKey } from '@/lib/cache';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string; id?: string; productId?: string }> | { slug: string; id?: string; productId?: string };
}

export const revalidate = 120;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = params instanceof Promise ? await params : params;
  const { slug } = resolved || {};
  const targetId = resolved?.id || resolved?.productId;
  if (!slug || !targetId) return { title: 'Event' };

  const company = await findCompanyCached(slug, 'lean');
  if (!company) return { title: 'Event' };

  const cacheKey = buildTenantCacheKey(company.id, 'event_meta', { id: targetId });
  const eventData = await fetchWithCache(
    cacheKey,
    () => prisma.event.findFirst({
      where: { id: targetId, companyId: company.id },
      select: { id: true, title: true, description: true, bannerImage: true },
    }),
    300
  );

  return {
    title: eventData ? `${eventData.title} | ${company.name}` : `Event | ${company.name}`,
    description: eventData?.description || company.description,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  const { slug } = resolved || {};
  const targetId = resolved?.id || resolved?.productId;

  if (!slug || !targetId) notFound();

  // 1. Fetch company tenant instance
  const company = await findCompanyCached(slug, 'lean');
  if (!company) notFound();

  // 2. Fetch targeted event record matching parameter conditions with singleflight caching
  const eventCacheKey = buildTenantCacheKey(company.id, 'event_detail', { id: targetId });
  const eventData = await fetchWithCache(
    eventCacheKey,
    () => prisma.event.findFirst({
      where: { id: targetId, companyId: company.id },
      include: { productCategory: true },
    }),
    300
  );

  if (!eventData) notFound();

  // 3. Fetch related upcoming events from the same company with caching
  const relatedCacheKey = buildTenantCacheKey(company.id, 'related_events', { excludeId: eventData.id });
  const relatedEvents = await fetchWithCache(
    relatedCacheKey,
    () => prisma.event.findMany({
      where: {
        companyId: company.id,
        NOT: { id: eventData.id },
      },
      orderBy: { startDateTime: 'asc' },
      take: 4,
    }),
    300
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#070708] text-zinc-900 dark:text-zinc-50 pt-20 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <EventDetailClient 
        event={eventData as unknown as IEvent} 
        related={(relatedEvents || []) as unknown as IEvent[]}
        storeData={company as unknown as StoreForm}
      />
      <NewsletterSection />
    </div>
  );
}