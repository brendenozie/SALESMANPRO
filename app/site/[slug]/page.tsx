// // app/site/[slug]/page.tsx


import { loadStore } from '@/lib/loadStore';

interface StorePageProps {
  params: Promise<{ slug: string }>;
}


export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;

  const { BodyComponent, pageData, raw } = await loadStore(slug);

  return (
    <main className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen w-full mx-auto">
      <BodyComponent pageData={pageData} companyId={raw.id} />
    </main>
  );
}

