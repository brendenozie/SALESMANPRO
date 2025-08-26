// app/[slug]/page.tsx

import DynamicStoreBody from '@/components/site/layouts/DynamicStoreBody';

// This component becomes incredibly simple!
export default async function StorePage() {
  return (
    <main className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* No more props needed. DynamicStoreBody will get its data from the 
        context that was set up in the layout.
      */}
      <DynamicStoreBody />
    </main>
  );
}