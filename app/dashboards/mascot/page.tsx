import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export default async function MascotDashboardSmartRedirect() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboards/mascot");
  }

  const user = session.user as any;
  const isSuperAdmin = (user.role || "").toUpperCase() === "SUPER_ADMIN";

  if (isSuperAdmin && !user.companyId) {
    redirect("/super-admin/mascot");
  }

  let companyId = user.companyId;
  if (!companyId) {
    const owned = await prisma.company.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true, slug: true },
    });
    if (owned) {
      redirect(`/admin/${owned.slug}/mascot`);
    }
    redirect("/stores");
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { slug: true },
  });

  if (company?.slug) {
    redirect(`/admin/${company.slug}/mascot`);
  }

  redirect("/stores");
}
