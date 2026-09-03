import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import SuperAdminAIControlCenter from "@/components/admin/SuperAdminAIControlCenter";

export const metadata: Metadata = {
  title: "Super Admin AI Control Center | SalesmanPro",
  description: "Platform-wide AI infrastructure, provider credentials, model routing and telemetry.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuperAdminAIPage() {
  try {
    await requireSuperAdmin();
  } catch (error: any) {
    if (error?.statusCode === 401) {
      redirect("/signin?callbackUrl=/super-admin/ai");
    }
    redirect("/unauthorized");
  }

  return <SuperAdminAIControlCenter />;
}
