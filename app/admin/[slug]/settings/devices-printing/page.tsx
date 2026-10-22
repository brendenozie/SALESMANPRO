import React from "react";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import DevicesPrintingClient from "./DevicesPrintingClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ storeId?: string; deviceId?: string; platform?: string }>;
}

export default async function DevicesPrintingPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  return (
    <DevicesPrintingClient
      companyId={company.id}
      companySlug={slug}
      companyName={company.name || "Business"}
      initialStoreId={sParams.storeId}
      initialDeviceId={sParams.deviceId}
    />
  );
}
