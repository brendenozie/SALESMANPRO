import React from 'react';
import { notFound } from 'next/navigation';
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertiesFaqsPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-slate-500">Company not found</div>;
  }

  const faqs = await prisma.fAQ.findMany({
    where: { companyId: company.id },
    orderBy: { order: "asc" },
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <QuestionMarkCircleIcon className="w-8 h-8 text-indigo-600" /> Property FAQs & Tenant Guidelines
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure frequently asked questions regarding leases, security deposits, viewing appointments, and building policies.
          </p>
        </div>
      </div>

      {/* List */}
      {faqs.length > 0 ? (
        <div className="space-y-4 max-w-4xl">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-xs flex items-center justify-center font-black">
                  Q
                </span>
                {faq.question}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 pl-8 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <QuestionMarkCircleIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No FAQs configured yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            Add common queries about rent collection, maintenance response times, and showing policies.
          </p>
        </div>
      )}

    </div>
  );
}
