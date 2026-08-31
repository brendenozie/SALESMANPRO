import { getAuthSession } from "@/lib/auth";
import { canAccessDashboard } from "@/lib/auth/authorization";
import { redirect } from "next/navigation";

export default async function StoresLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(
      "https://auth.salesmanpro.site/signin?callbackUrl=" +
        encodeURIComponent("https://salesmanpro.site/stores"),
    );
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

  return (
    <div className="min-h-screen bg-gray-50 bg-gradient-to-b from-gray-100 to-gray-50 dark:bg-gray-900 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900">
      {children}
    </div>
  );
}
