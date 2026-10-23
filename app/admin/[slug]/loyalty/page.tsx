import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import LoyaltyProgramClient from "./LoyaltyProgramClient";

export const metadata = { title: "Loyalty & Rewards Programme | SalesMan Pro" };

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LoyaltyProgramPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) redirect("/dashboard");

  return <LoyaltyProgramClient companyId={company.id} slug={slug} />;
}
