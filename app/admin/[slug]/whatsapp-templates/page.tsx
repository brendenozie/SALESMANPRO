import { cookies } from "next/headers";
import WhatsAppTemplatesClient, { Template } from "./WhatsAppTemplatesClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WhatsAppTemplatesPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-slate-500">Company configuration not found.</div>;
  }

  const companyId = company.id;
  let initialTemplates: Template[] = [];

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/whatsapp/templates?companyId=${encodeURIComponent(
        companyId
      )}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 30 },
      }
    );

    if (res.ok) {
      initialTemplates = (await res.json()).data;
    }
  } catch (err) {
    console.error("[WhatsAppTemplatesPage] Failed to fetch templates", err);
  }

  return (
    <WhatsAppTemplatesClient
      initialTemplates={initialTemplates}
      companyId={companyId}
    />
  );
}