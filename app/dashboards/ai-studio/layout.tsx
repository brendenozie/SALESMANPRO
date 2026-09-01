import { getAuthSession } from "@/lib/auth";
import { canAccessDashboard } from "@/lib/auth/authorization";
import { redirect } from "next/navigation";

export default async function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("https://auth.salesmanpro.site/signin?callbackUrl=" + encodeURIComponent("https://salesmanpro.site/dashboards"));
  }

  const user = session.user as any;
  if (user.emailVerified === false) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email || "")}`);
  }

  if (
    !canAccessDashboard({
      role: user.role,
      companyId: user.companyId,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      hasTenantAccess: user.hasTenantAccess,
    })
  ) {
    redirect("/unauthorized?reason=forbidden");
  }

  return <>{children}</>;
}
