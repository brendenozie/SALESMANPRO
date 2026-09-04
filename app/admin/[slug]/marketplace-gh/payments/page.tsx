import React from "react";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import prisma from "@/server/db/prismadb";
import { getGhubaAdminMetrics } from "@/lib/payments/reportingService";
import GhubaPaymentsClient from "./GhubaPaymentsClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GhubaPaymentsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(
      "https://auth.salesmanpro.site/signin?callbackUrl=" +
        encodeURIComponent(`https://salesmanpro.site/admin/${slug}/marketplace-gh/payments`)
    );
  }

  const user = session.user as any;
  const role = (user.role || "").toUpperCase();

  // Ghuba marketplace admin verification
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/unauthorized?reason=forbidden");
  }

  const initialMetrics = await getGhubaAdminMetrics({ period: "30days" });

  return (
    <GhubaPaymentsClient
      slug={slug}
      initialMetrics={initialMetrics}
    />
  );
}
