import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import StockTransferClient from "./StockTransferClient";

export const metadata = { title: "Stock Transfers | SalesMan Pro" };

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StockTransferPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) redirect("/dashboard");

  return <StockTransferClient companyId={company.id} slug={slug} />;
}
