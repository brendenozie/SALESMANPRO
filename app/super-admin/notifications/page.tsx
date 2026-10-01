import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import NotificationOpsClient from "@/components/admin/notifications/NotificationOpsClient";

export const metadata: Metadata = {
  title: "Notification Command Center | Super Admin | SalesmanPro",
  description: "Ecosystem-wide notification delivery health, channel routing, cross-platform devices, and incident telemetry.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuperAdminNotificationsPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/signin?callbackUrl=/super-admin/notifications");
  }

  const user = session.user as any;
  const role = (user.role || "").toUpperCase();

  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    redirect("/unauthorized?reason=super_admin_required");
  }

  return <NotificationOpsClient />;
}
