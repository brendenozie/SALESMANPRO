import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import MascotSettingsClient from "./MascotSettingsClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MascotSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/admin/${slug}/settings/ai-mascot`);
  }

  const identifier = slug || session.user.id;
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  return (
    <MascotSettingsClient
      companyId={company.id}
      storeSlug={company.slug || slug}
      storeCategory={company.category || "E-commerce"}
    />
  );
}
