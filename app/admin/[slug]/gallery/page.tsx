import React from "react";
import AdminGalleryManager from "./AdminGalleryManager";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import { cookies } from "next/headers";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// ✨ Updated Agent type to include the loginCode
export type Agent = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  loginCode?: string; // Add loginCode, make it optional for safety
  totalSales: number;
  totalCommissions: number;
  recentTransaction: {
    amount: number;
    date: string | null;
  };
  recentCommission: {
    amount: number;
    date: string | null;
    status: string;
  };
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GalleryPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;

  return <AdminGalleryManager companyId={companyId} />;
}