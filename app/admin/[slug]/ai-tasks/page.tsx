import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import MascotTaskCenterClient from "./MascotTaskCenterClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MascotTasksPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!(session?.user as any)?.id) {
    redirect(`/auth/signin?callbackUrl=/admin/${slug}/ai-tasks`);
  }

  const identifier = slug || (session?.user as any)?.id;
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  return (
    <MascotTaskCenterClient
      companyId={company.id}
      storeSlug={company.slug || slug}
      storeName={company.name || "Store"}
      userRole={(session?.user as any)?.role || "ADMIN"}
    />
  );
}
