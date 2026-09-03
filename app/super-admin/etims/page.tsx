import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import SuperAdminEtimsClient from "./SuperAdminEtimsClient";

export const metadata: Metadata = {
  title: "Super Admin eTIMS Monitoring | SalesmanPro",
  description: "Platform-wide KRA eTIMS integration health, store metrics, and error queue recovery.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuperAdminEtimsPage() {
  // try {
  //   await requireSuperAdmin();
  // } catch (error: any) {
  //   if (error?.statusCode === 401) {
  //     redirect("/signin?callbackUrl=/super-admin/etims");
  //   }
  //   redirect("/unauthorized");
  // }

  return <SuperAdminEtimsClient />;
}
