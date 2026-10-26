import React from "react";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { listStoreDirectPayLinks } from "@/lib/pay-links/service";
import { DirectPayLinksManager } from "@/components/dashboard/DirectPayLinksManager";
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function StorePayLinksPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-slate-400">
        Store not found. Please log in or verify store slug.
      </div>
    );
  }

  // Fetch initial direct pay links
  const links = await listStoreDirectPayLinks(company.id);

  // Fetch products for the creation modal
  const products = await prisma.marketplaceListings.findMany({
    where: { companyId: company.id },
    select: {
      id: true,
      productId: true,
      name: true,
      image: true,
      images: true,
      sellingPrice: true,
      price: true,
      option: true,
    },
    take: 100,
  });

  return (
    <div className="container mx-auto p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Direct Pay Links & Quick Checkout
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate shareable 1-tap checkout links for WhatsApp, social media, and direct sales.
        </p>
      </div>

      <DirectPayLinksManager
        companyId={company.id}
        initialLinks={links}
        products={products}
      />
    </div>
  );
}
