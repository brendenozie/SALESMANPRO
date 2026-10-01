import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import StoreNotificationsClient from "./StoreNotificationsClient";

export const metadata: Metadata = {
  title: "Store Notifications | SalesmanPro",
  description: "Operational store notifications, low stock alerts, and staff briefings.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreNotificationsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(`/signin?callbackUrl=/admin/${slug}/notifications`);
  }

  const identifier = slug || (session?.user as any)?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-gray-500">
        Store or company not found for identifier: {slug}
      </div>
    );
  }

  return (
    <StoreNotificationsClient
      company={{
        id: company.id,
        name: company.name || "Store",
        slug,
      }}
    />
  );
}
