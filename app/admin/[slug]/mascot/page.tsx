import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";
import StoreMascotDashboardClient from "./StoreMascotDashboardClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; provider?: string; connected?: string; error?: string }>;
}

export const metadata = {
  title: "AI Mascot Operations Hub | Store Admin Console",
  description: "Unified AI mascot assistant, background tasks, account connections, and human-in-the-loop approvals.",
};

export default async function StoreMascotOperationsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/admin/${slug}/mascot`);
  }

  const user = session.user as any;
  if (user.emailVerified === false) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email || "")}`);
  }

  const identifier = slug || user.id;
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  const staff = await prisma.staffProfile.findUnique({
    where: { userId: user.id },
    select: { companyId: true },
  });

  const hasAccess = canAccessCompanyAdmin({
    user: {
      id: user.id,
      role: user.role,
      companyId: user.companyId,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
    },
    company: { id: company.id, userId: company.userId },
    staffCompanyId: staff?.companyId,
  });

  if (!hasAccess) {
    redirect(`/unauthorized?reason=store_admin_required`);
  }

  return (
    <StoreMascotDashboardClient
      companyId={company.id}
      storeSlug={company.slug || slug}
      storeName={company.name || "Store"}
      userRole={user.role || "ADMIN"}
      userId={user.id}
      initialTab={query.tab || "overview"}
      bannerNotice={
        query.connected
          ? { type: "success", message: `Successfully connected ${query.provider || "account"}!` }
          : query.error
          ? { type: "error", message: `Connection error: ${query.error}` }
          : undefined
      }
    />
  );
}
