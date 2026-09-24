import React from 'react';
import { notFound } from 'next/navigation';
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";
import { StarIcon, ChatBubbleBottomCenterTextIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/solid';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertiesTestimonialsPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-slate-500">Company not found</div>;
  }

  const testimonials = await prisma.testimonial.findMany({
    where: { companyId: company.id },
    orderBy: { order: "asc" },
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-amber-500" /> Client Testimonials & Reviews
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage verified client reviews, tenant endorsements, and buyer testimonials showcased on your property storefront.
          </p>
        </div>
      </div>

      {/* Grid */}
      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-3 text-amber-400">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.authorName || "Verified Tenant"}</h4>
                  <p className="text-xs text-slate-400">{t.authorTitle || "Resident"}</p>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full flex items-center gap-1 ${
                  t.status === "APPROVED" 
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                }`}>
                  {t.status === "APPROVED" ? <CheckBadgeIcon className="w-3.5 h-3.5" /> : <ClockIcon className="w-3.5 h-3.5" />}
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No testimonials published yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            As tenants, buyers, and guests submit reviews, they will appear here for your moderation and publishing.
          </p>
        </div>
      )}

    </div>
  );
}
