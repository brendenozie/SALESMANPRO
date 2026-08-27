
import { cookies } from "next/headers";
import AiImagesClient from "./AiImagesClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AiImagesPage({ params }: PageProps) {
  const { slug } = await params;
  
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-slate-500">Company configuration not found.</div>;
  }

  return (
    <AiImagesClient companyId="{company.id}"/>
  );
}