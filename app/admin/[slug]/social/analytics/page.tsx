/**
 * app/admin/[slug]/social/analytics/page.tsx
 *
 * Dedicated Social Analytics route.
 */

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import SocialDashboardClient from "@/components/social/SocialDashboardClient";

export const metadata: Metadata = {
  title: "Social Analytics | SalesmanPro",
  description: "Cross-platform reach, engagement, and conversion metrics.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SocialAnalyticsPage({ params }: PageProps) {
  const { slug } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/admin/${slug}/social/analytics`);
  }

  const identifier = slug || session.user.id;
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  return <SocialDashboardClient companyId={company.id} slug={slug} />;
}
