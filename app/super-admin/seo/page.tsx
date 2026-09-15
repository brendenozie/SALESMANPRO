import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import SuperAdminSeoControlCenter from "@/components/admin/SuperAdminSeoControlCenter";

export const metadata: Metadata = {
  title: "Super Admin SEO & Discovery Center | SalesmanPro",
  description: "Platform-wide SEO governance, multi-tenant canonicals, dynamic sitemaps, and IndexNow search engine indexing.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuperAdminSeoPage() {
  try {
    await requireSuperAdmin();
  } catch (error: any) {
    if (error?.statusCode === 401) {
      redirect("/signin?callbackUrl=/super-admin/seo");
    }
    redirect("/unauthorized");
  }

  return <SuperAdminSeoControlCenter />;
}
