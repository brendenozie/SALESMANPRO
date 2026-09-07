import React from "react";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { loadStore } from "@/lib/loadStore";
import { getEnabledPaymentMethods } from "@/utils/payment-utils";
import {
  getOrCreateWebsite,
  getWebsiteRevisions,
} from "@/lib/website-builder/website-service";
import WebsiteBuilderStudio from "@/components/website-builder/editor/WebsiteBuilderStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminWebsiteBuilderPage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!session?.user?.id && process.env.NODE_ENV !== "development") {
    redirect(`/signin?callbackUrl=/admin/${slug}/website-builder`);
  }

  // Load the company with full store context identical to public storefront
  const { raw, pageData, ghubaData } = await loadStore(slug);
  if (!raw) {
    notFound();
  }

  const enabledPaymentMethods = getEnabledPaymentMethods(raw?.PaymentSettings);

  // Get or lazily synthesize the tenant's editable website config
  const { website, config } = await getOrCreateWebsite(raw.id);

  // Fetch revisions history for versioning/rollback modal
  const revisions = await getWebsiteRevisions(raw.id);

  return (
    <div className="w-full h-[calc(100vh-4.25rem)] overflow-hidden">
      <WebsiteBuilderStudio
        initialConfig={config}
        storeSlug={raw.slug}
        storeName={raw.name}
        companyId={raw.id}
        category={raw.category}
        variant={raw.variant}
        storeFormData={pageData}
        paymentMethods={enabledPaymentMethods}
        ghubaData={ghubaData}
        storeLogoUrl={raw.logoUrl || raw.logo || raw.bannerUrl}
        contactPhone={raw.contactPhone || raw.phone}
        contactEmail={raw.contactEmail || raw.email}
        address={raw.address || raw.addresses?.[0]?.address}
        socialLinks={raw.socialLinks || []}
        initialRevisions={revisions.map((r: any) => ({
          ...r,
          publishedAt: r.createdAt
            ? typeof r.createdAt === "string"
              ? r.createdAt
              : r.createdAt.toISOString()
            : new Date().toISOString(),
        }))}
      />
    </div>
  );
}
