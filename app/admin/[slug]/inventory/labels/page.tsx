import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import BarcodeLabelStudioClient from "./BarcodeLabelStudioClient";

export const metadata = { title: "Barcode & Shelf Label Studio | SalesMan Pro" };

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BarcodeLabelsPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) redirect("/dashboard");

  return (
    <BarcodeLabelStudioClient
      companyId={company.id}
      companyName={company.name}
      slug={slug}
      currency={company.currency || "KES"}
    />
  );
}
