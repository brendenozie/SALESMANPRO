// app/[slug]/products/[productId]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import { StoreForm, IEvent } from '@/types/typings';
import EventDetailClient from './EventDetailClient';

interface PageProps {
  params: Promise<{ slug: string; productId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: PageProps) {
  const { slug, productId } = await params;

  // 1. Fetch company tenant instance
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) notFound();

  // 2. Fetch targeted event record matching parameter conditions
  const eventData = await prisma.event.findFirst({
    where: { id: productId, companyId: company.id },
    include: { productCategory: true },
  });

  if (!eventData) notFound();

  // 3. Fetch related upcoming events from the same company
  const relatedEvents = await prisma.event.findMany({
    where: {
      companyId: company.id,
      NOT: { id: eventData.id },
    },
    orderBy: { startDateTime: 'asc' },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#070708] text-zinc-900 dark:text-zinc-50 pt-20 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <EventDetailClient 
        event={eventData as unknown as IEvent} 
        related={relatedEvents as unknown as IEvent[]}
        storeData={company as unknown as StoreForm}
      />
      <NewsletterSection />
    </div>
  );
}