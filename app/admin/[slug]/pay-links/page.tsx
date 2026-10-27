import React from "react";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { listStoreDirectPayLinks } from "@/lib/pay-links/service";
import { DirectPayLinksManager } from "@/components/dashboard/DirectPayLinksManager";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

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

  // Safely fetch initial direct pay links
  let links: any[] = [];
  try {
    links = await listStoreDirectPayLinks(company.id);
  } catch (err) {
    console.error("[StorePayLinksPage] Error fetching direct pay links:", err);
  }

  // Safely fetch products for the creation modal
  let products: any[] = [];
  try {
    const rawListings = await prisma.marketplaceListings.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        productId: true,
        name: true,
        images: true,
        sellingPrice: true,
        option: true,
      },
      take: 100,
    });

    products = rawListings.map((p) => {
      const rawImage =
        Array.isArray(p.images) && p.images.length > 0
          ? typeof p.images[0] === "string"
            ? p.images[0]
            : (p.images[0] as any)?.url || (p.images[0] as any)?.src || null
          : null;

      return {
        id: p.id,
        productId: p.productId,
        name: p.name,
        image: rawImage,
        images: p.images,
        sellingPrice: p.sellingPrice ?? 0,
        price: p.sellingPrice ?? 0,
        option: p.option,
      };
    });
  } catch (err) {
    console.error("[StorePayLinksPage] Error fetching marketplace products:", err);
  }

  // Safely serialize across RSC boundary to prevent serialization crashes
  const safeLinks = JSON.parse(JSON.stringify(links));
  const safeProducts = JSON.parse(JSON.stringify(products));

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
        initialLinks={safeLinks}
        products={safeProducts}
      />
    </div>
  );
}
