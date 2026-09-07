import React from "react";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";
import { getOrCreateWebsite } from "@/lib/website-builder/website-service";
import WebsiteBuilderStudio from "@/components/website-builder/editor/WebsiteBuilderStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminWebsiteBuilderPage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/admin/${slug}/website-builder`);
  }

  // Load the company
  const company = await findCompanyCached(slug, "page");
  if (!company) {
    notFound();
  }

  // Get or lazily synthesize the tenant's editable website config
  const { website, config } = await getOrCreateWebsite(company.id);

  // Fetch revisions history for versioning/rollback modal
  const revisions = await prisma.websiteRevision.findMany({
    where: { websiteId: website.id },
    orderBy: { versionNumber: "desc" },
    take: 20,
    select: {
      id: true,
      versionNumber: true,
      changeSummary: true,
      publishedAt: true,
      publishedBy: true,
    },
  });

  return (
    <div className="w-full h-[calc(100vh-4.25rem)] overflow-hidden">
      <WebsiteBuilderStudio
        initialConfig={config}
        storeSlug={company.slug}
        storeName={company.name}
        companyId={company.id}
        storeLogoUrl={company.logo}
        contactPhone={company.phone}
        contactEmail={company.email}
        address={company.addresses?.[0]?.address || company.address}
        socialLinks={company.socialLinks || []}
        initialRevisions={revisions.map((r: any) => ({
          ...r,
          publishedAt: r.publishedAt ? r.publishedAt.toISOString() : new Date().toISOString(),
        }))}
      />
    </div>
  );
}
