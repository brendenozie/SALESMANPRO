import { cookies } from "next/headers";
import WhatsAppDashboardClient from "./WhatsAppDashboardClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { WhatsAppOverviewResponse } from "@/lib/api/whatsAppClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WhatsAppOverviewPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-slate-500">Company configuration not found.</div>;
  }

  const companyId = company.id;
  let initialOverview: WhatsAppOverviewResponse | undefined = undefined;

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/whatsapp/overview?companyId=${encodeURIComponent(companyId)}&range=30d`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 15 },
      }
    );

    if (res.ok) {
      const body = await res.json();
      initialOverview = body.data;
    }
  } catch (err) {
    console.error("[WhatsAppOverviewPage] Failed to prefetch overview metrics", err);
  }

  return (
    <WhatsAppDashboardClient
      initialOverview={initialOverview}
      companyId={companyId}
      slug={slug}
    />
  );
}
