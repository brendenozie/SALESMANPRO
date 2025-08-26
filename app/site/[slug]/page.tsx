import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import DynamicStoreBody from '@/components/site/layouts/DynamicStoreBody';

export default async function StorePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // The full Prisma query remains in this Server Component.
  const raw = await prisma.company.findUnique({
    where: { slug },
    include: {
      socialLinks: true,
      blogs: { orderBy: { publishedAt: 'desc' } },
      policies: true,
      faqs: { orderBy: { order: 'asc' } },
      testimonials: { orderBy: { order: 'asc' } },
      heroSlides: { orderBy: { order: 'asc' } },
      promotions: true,
      SEO: true,
      AnalyticsConfig: true,
      PaymentSettings: true,
      ShippingSettings: true,
      PageSection: { orderBy: { order: 'asc' } },
      appPromos: true,
      Collection: { orderBy: { order: 'asc' } },
      Announcement: { orderBy: { publishedAt: 'desc' } },
      events: { orderBy: { startDateTime: 'asc' } },
      marketplaceListings: {
        where: { status: 'ACTIVE' },
        take: 20,
        select: {
          id: true, name: true, description: true, finalPrice: true, sellingPrice: true, images: true, isAvailable: true, isFeatured: true, category: true,
        },
      },
      StoreCategory: { orderBy: { sortOrder: 'asc' }, include: { category: { select: { id: true, name: true, slug: true, image: true, icon: true } } } },
      Writer: { include: { user: { select: { id: true, name: true, image: true } } } },
      Doctor: { include: { User: { select: { id: true, name: true, image: true } } } },
      salesAgents: { include: { user: { select: { id: true, name: true, image: true } } } },
      Podcast: true,
      courses: true,
      services: true,
      CompanyLocation: { include: { location: true } }
    },
  });

  if (!raw) {
    return notFound();
  }

  const storeFormData = transformCompanyToStoreForm(raw);

  return (
    <main className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Pass the server-fetched data to the new Client Component */}
      <DynamicStoreBody initialStoreData={storeFormData} />
    </main>
  );
}