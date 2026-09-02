/**
 * app/admin/[slug]/social/calendar/page.tsx
 *
 * Dedicated Content Calendar route.
 */

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import SocialDashboardClient from "@/components/social/SocialDashboardClient";

export const metadata: Metadata = {
  title: "Content Calendar | SalesmanPro Social Media",
  description: "Schedule and manage social media publishing calendar.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SocialCalendarPage({ params }: PageProps) {
  const { slug } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/admin/${slug}/social/calendar`);
  }

  const identifier = slug || session.user.id;
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  return <SocialDashboardClient companyId={company.id} slug={slug} />;
}
