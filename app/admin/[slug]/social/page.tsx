/**
 * app/admin/[slug]/social/page.tsx
 *
 * Store-facing Social Media AI & Content Marketing Command Center.
 */

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import SocialDashboardClient from "@/components/social/SocialDashboardClient";

export const metadata: Metadata = {
  title: "Social Media AI Marketing | SalesmanPro",
  description: "Create, schedule, and publish platform-adapted social campaigns to Facebook, Instagram, TikTok & YouTube.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SocialMarketingPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/admin/${slug}/social`);
  }

  const identifier = slug || session.user.id;
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  const initialProduct = resolvedSearchParams?.productId
    ? {
        productId: resolvedSearchParams.productId as string,
        name: resolvedSearchParams.name as string | undefined,
        category: resolvedSearchParams.category as string | undefined,
        description: resolvedSearchParams.description as string | undefined,
        price: resolvedSearchParams.price as string | undefined,
        imageUrl: resolvedSearchParams.image as string | undefined,
      }
    : undefined;

  return (
    <SocialDashboardClient
      companyId={company.id}
      slug={slug}
      initialProduct={initialProduct}
    />
  );
}
