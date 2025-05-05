// pages/stores/[slug].tsx
import React,{ useState } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';

// Define theme settings per category
const CATEGORY_THEMES: Record<string, { primary: string; accent: string; bannerOverlay: string }> = {
  'Tech Gadgets': {
    primary: 'from-blue-600 to-blue-400',
    accent: 'text-blue-200',
    bannerOverlay: 'bg-gradient-to-tr',
  },
  Vehicles: {
    primary: 'from-gray-800 to-gray-600',
    accent: 'text-yellow-300',
    bannerOverlay: 'bg-gradient-to-br',
  },
  Fashion: {
    primary: 'from-pink-500 to-purple-500',
    accent: 'text-white',
    bannerOverlay: 'bg-gradient-to-r',
  },
  Household: {
    primary: 'from-green-600 to-green-400',
    accent: 'text-green-100',
    bannerOverlay: 'bg-gradient-to-bl',
  },
  'Sports & Outdoors': {
    primary: 'from-orange-500 to-yellow-400',
    accent: 'text-white',
    bannerOverlay: 'bg-gradient-to-tl',
  },
  'Beauty & Health': {
    primary: 'from-pink-700 to-pink-500',
    accent: 'text-white',
    bannerOverlay: 'bg-gradient-to-t',
  },
  'Toys & Hobbies': {
    primary: 'from-purple-600 to-pink-400',
    accent: 'text-white',
    bannerOverlay: 'bg-gradient-to-tr',
  },
  Other: {
    primary: 'from-gray-500 to-gray-300',
    accent: 'text-white',
    bannerOverlay: 'bg-gradient-to-br',
  },
};

// const CATEGORY_THEMES: Record<string, { primary: string; accent: string; bannerFilter: string }> = {
//   'Tech Gadgets': {
//     primary: 'bg-blue-600',
//     accent: 'text-blue-400',
//     bannerFilter: 'opacity-80',
//   },
//   Vehicles: {
//     primary: 'bg-gray-800',
//     accent: 'text-yellow-300',
//     bannerFilter: 'grayscale',
//   },
//   Fashion: {
//     primary: 'bg-pink-500',
//     accent: 'text-purple-200',
//     bannerFilter: 'contrast-125',
//   },
//   Household: {
//     primary: 'bg-green-600',
//     accent: 'text-green-300',
//     bannerFilter: 'brightness-90',
//   },
//   'Sports & Outdoors': {
//     primary: 'bg-orange-500',
//     accent: 'text-yellow-100',
//     bannerFilter: 'saturate-150',
//   },
//   'Beauty & Health': {
//     primary: 'bg-pink-700',
//     accent: 'text-pink-300',
//     bannerFilter: 'sepia',
//   },
//   'Toys & Hobbies': {
//     primary: 'bg-purple-600',
//     accent: 'text-pink-100',
//     bannerFilter: 'hue-rotate-15',
//   },
//   Other: {
//     primary: 'bg-gray-500',
//     accent: 'text-gray-200',
//     bannerFilter: '',
//   },
// };

function Layout({ children }:any) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between">
          <Link href="/" className="text-2xl font-bold">My Marketplace </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4">{children}</main>
      <footer className="text-center py-4 text-sm text-gray-500">
        &copy; 2025 My Marketplace
      </footer>
    </div>
  );
}

// pages/stores/[slug].tsx
// import { GetServerSideProps } from 'next';
// import prisma from '@/server/db/prismadb';
// import Image from 'next/image';
// import Link from 'next/link';

// Category color gradients
// const CATEGORY_GRADIENTS: Record<string, string> = {
//   'Tech Gadgets': 'from-blue-600 to-blue-400',
//   Vehicles: 'from-gray-800 to-gray-600',
//   Fashion: 'from-pink-500 to-purple-500',
//   Household: 'from-green-600 to-green-400',
//   'Sports & Outdoors': 'from-orange-500 to-yellow-400',
//   'Beauty & Health': 'from-pink-700 to-pink-500',
//   'Toys & Hobbies': 'from-purple-600 to-pink-400',
//   Other: 'from-gray-500 to-gray-300',
// };

export default function StorePage({ store }: any) {
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Store not found</p>
      </div>
    );
  }

  const gradient = CATEGORY_THEMES[store.category] || CATEGORY_THEMES.Other;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">My Marketplace</Link>
        </div>
      </header>

      {/* Banner */}
      <div className={`relative h-64 w-full overflow-hidden bg-gradient-to-tr ${gradient}`}> 
        <div className={`absolute inset-0 ${gradient.bannerOverlay} opacity-50`}></div>
        <img
          src={store.bannerUrl}
          alt={`${store.name} banner`}
          className="object-cover w-full h-full"
          style={{ filter: 'brightness(0.7)' }} // Adjust brightness for better text visibility
        />
        {/* Uncomment the Image component when you have the image URL */}
        {/* <Image
          src={store.bannerUrl}
          alt={`${store.name} banner`}
          layout="fill"
          objectFit="cover"
          className="object-center opacity-60"

        /> */}
        <div className="absolute inset-0 flex items-end p-6">
          <div className="flex items-center space-x-4">
            <div className="relative h-16 w-16">
              {/* <Image
                src={store.logoUrl}
                alt={`${store.name} logo`}
                layout="fill"
                objectFit="cover"
                className="rounded-full border-4 border-white"
              /> */}
            </div>
            <h1 className="text-4xl font-bold text-white">{store.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Description Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{store.category}</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{store.description}</p>
        </section>

        {/* Contact Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact & Address</h3>
          <p className="mb-1">
            Email:{' '}
            <Link href={`mailto:${store.contactEmail}`}  className="text-blue-500 dark:text-blue-400">{store.contactEmail}
            </Link>
          </p>
          <p className="mb-1">Phone: <span className="font-mono text-gray-900 dark:text-gray-100">{store.contactPhone}</span></p>
          <p>Address: {store.address}</p>
        </section>

        {/* TODO: Products grid goes here */}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} My Marketplace
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }: any) => {
  const slug = params.slug as string;
  const store = await prisma.company.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      logoUrl: true,
      bannerUrl: true,
      contactEmail: true,
      contactPhone: true,
      address: true,
    },
  });

  if (!store) {
    return { notFound: true };
  }

  return {
    props: { store },
  };
};
