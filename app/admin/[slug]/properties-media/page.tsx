import React from 'react';
import { notFound } from 'next/navigation';
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";
import Link from 'next/link';
import { PhotoIcon, FilmIcon, PlusIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertiesMediaPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-slate-500">Company not found</div>;
  }

  // Fetch properties with images and media
  const listings = await prisma.marketplaceListings.findMany({
    where: { companyId: company.id },
    select: {
      id: true,
      name: true,
      images: true,
      videos: true,
      category: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalImages = listings.reduce((acc, l) => acc + (Array.isArray(l.images) ? l.images.length : 0), 0);
  const totalVideos = listings.reduce((acc, l) => acc + (Array.isArray(l.videos) ? l.videos.length : 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <PhotoIcon className="w-8 h-8 text-indigo-600" /> Property Media Library
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage high-resolution photography, virtual video tours, and floor plans across your portfolio.
          </p>
        </div>
        <Link
          href={`/admin/${slug}/ai-media-library`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
        >
          <PlusIcon className="w-4 h-4" /> AI Media Studio
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Properties with Media</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{listings.length}</h3>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hosted Images</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-1">{totalImages}</h3>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Video Walkthroughs</p>
          <h3 className="text-3xl font-black text-indigo-600 mt-1">{totalVideos}</h3>
        </div>
      </div>

      {/* Properties Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => {
          const imgs = Array.isArray(item.images) ? (item.images as any[]) : [];
          const vids = Array.isArray(item.videos) ? (item.videos as any[]) : [];
          const thumb = imgs[0]?.url || imgs[0] || "/placeholder-property.jpg";

          return (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                <img src={typeof thumb === "string" ? thumb : thumb.url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <PhotoIcon className="w-3.5 h-3.5" /> {imgs.length} Photos
                  </span>
                  {vids.length > 0 && (
                    <span className="px-2.5 py-1 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <FilmIcon className="w-3.5 h-3.5" /> {vids.length} Videos
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">{item.name}</h4>
                  <p className="text-xs text-slate-400 capitalize mt-0.5">{item.category || "Property"}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <Link
                    href={`/admin/${slug}/properties`}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    Manage Listing <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/site/${slug}/realestate/listings/${item.id}`}
                    target="_blank"
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Preview Site
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
