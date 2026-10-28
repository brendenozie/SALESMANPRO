import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import StockAuditClient from "./StockAuditClient";

export const metadata = {
  title: "Stock Audit & Cycle Count | SalesmanPro",
  description: "Mobile barcode stock counting tool with variance tracking and adjustment vouchers.",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StockAuditPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const identifier = slug || (session?.user as any)?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) redirect("/dashboard");

  return (
    <StockAuditClient
      companyId={company.id}
      companyName={company.name || "SalesmanPro Store"}
      slug={slug}
      currency={company.currency || "KES"}
    />
  );
}
