import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import ObservabilityPortalClient from "@/components/admin/observability/ObservabilityPortalClient";

export const metadata: Metadata = {
  title: "Superadmin Observability & Performance Portal | SalesmanPro",
  description: "Real-time infrastructure health, live traffic, APM, database, Redis, queues, alerts, and system diagnostics.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuperAdminObservabilityPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/signin?callbackUrl=/super-admin/observability");
  }

  const user = session.user as any;
  const role = (user.role || "").toUpperCase();

  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    redirect("/unauthorized?reason=super_admin_required");
  }

  return <ObservabilityPortalClient />;
}
