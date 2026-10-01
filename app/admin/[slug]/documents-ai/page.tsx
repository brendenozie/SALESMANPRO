import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import MascotDocumentIntelligenceClient from "./MascotDocumentIntelligenceClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MascotDocumentsAiPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!(session?.user as any)?.id) {
    redirect(`/auth/signin?callbackUrl=/admin/${slug}/documents-ai`);
  }

  const identifier = slug || (session?.user as any)?.id;
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  return (
    <MascotDocumentIntelligenceClient
      companyId={company.id}
      storeSlug={company.slug || slug}
      storeName={company.name || "Store"}
      storeCategory={(company as any).businessType || (company as any).category || "General"}
      userRole={(session?.user as any)?.role || "ADMIN"}
    />
  );
}
