import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import SuperAdminWorkforceCenter from "@/components/admin/SuperAdminWorkforceCenter";

export const metadata: Metadata = {
  title: "Super Admin AI Workforce & Growth Center | SalesmanPro",
  description: "Manage the 3-Tier AI Agent Workforce, SaaS outbound acquisition pipeline, and Ghuba marketplace liquidity.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuperAdminAIWorkforcePage() {
  try {
    await requireSuperAdmin();
  } catch (error: any) {
    if (error?.statusCode === 401) {
      redirect("/signin?callbackUrl=/super-admin/ai-workforce");
    }
    redirect("/unauthorized");
  }

  return <SuperAdminWorkforceCenter />;
}
