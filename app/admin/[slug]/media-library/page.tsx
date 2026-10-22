import React from "react";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import MediaLibraryClient from "./MediaLibraryClient";

interface PageProps {
  params: Promise<{ adminSlug?: string; slug?: string }>;
}

export default async function MediaLibraryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.adminSlug || resolvedParams.slug || "";

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";

  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="p-8 text-center text-zinc-500 font-medium">
        Store not found. Please log in or verify your store address.
      </div>
    );
  }

  return (
    <MediaLibraryClient
      companyId={company.id}
      slug={slug}
      storeName={company.name || "Your Store"}
    />
  );
}
