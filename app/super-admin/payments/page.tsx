import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { getPlatformPaymentMetrics } from "@/lib/payments/reportingService";
import SuperAdminPaymentsClient from "./SuperAdminPaymentsClient";

export const metadata: Metadata = {
  title: "Global Payments Intelligence | SalesmanPro Super Admin",
  description: "Platform-wide financial visibility, gateway breakdown, Ghuba volume, and platform revenue.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuperAdminPaymentsPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/super-admin/payments");
  }

  const user = session.user as any;
  const role = (user.role || "").toUpperCase();

  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    redirect("/unauthorized?reason=super_admin_required");
  }

  // Pre-load 30-day global metrics on server
  const initialMetrics = await getPlatformPaymentMetrics({ period: "30days" });

  return <SuperAdminPaymentsClient initialMetrics={initialMetrics} />;
}
