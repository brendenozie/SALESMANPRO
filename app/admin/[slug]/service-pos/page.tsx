// app/admin/[slug]/pos/page.tsx
import React from "react";
import AdminPOSClient from "./AdminPOSClient";
import { MarketListingForm, IStoreCategory } from "@/types/typings";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

/**
 * Server Component: Fetches initial data for the Service POS.
 */
export default async function PosPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  
  // 1. Safely resolve the company
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;
  const { page = "1", limit = "20" } = await searchParams;
  let totalPages = 1;
  
  const cookieHeaders = (await cookies()).toString();
  const userName = session?.user?.name || "Guest";

  // 2. Fetch staff members for service specialist assignment
  let initialStaff: { id: string; name: string; role: string }[] = [];
  try {
    const staffMembers = await prisma.staffProfile.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    initialStaff = staffMembers.map(s => ({
      id: s.id,
      name: s.user?.name || s.jobTitle || "Staff Member",
      role: s.jobTitle || "Specialist"
    }));
  } catch (error) {
    console.error("Error fetching staff profiles for Service POS:", error);
  }

  // Fallback: If no dedicated staff profile records exist, include current user/operator
  if (initialStaff.length === 0) {
    initialStaff.push({
      id: session?.user?.id || "staff-operator",
      name: userName,
      role: "Lead Specialist / Operator"
    });
  }

  // 3. Extract verified company info
  const initialCompanyInfo = {
    name: company.name || "Service Hub",
    address: company.address || company.city || "Headquarters",
    phone: company.phone || company.contactEmail || "+254 700 000 000",
    currency: (company as any).currency || "KES",
    taxRate: (company as any).taxRate ?? 0.00,
  };

  let initialCategories: IStoreCategory[] = [];
  let initialProducts: MarketListingForm[] = [];

  try {
    // Fetch Store Categories
    const categoriesRes = await fetch(`${apiBaseUrl}/admin/pos-categories?companyId=${companyId}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders },
    });
    if (categoriesRes.ok) {
      const categoriesData = (await categoriesRes.json()).data;
      initialCategories = categoriesData.categories || [];
    } else {
      console.error(`Failed to fetch categories: ${categoriesRes.status} ${categoriesRes.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  try {
    // Fetch Marketplace Listings (Services / Products)
    const productsRes = await fetch(`${apiBaseUrl}/admin/pos-marketplace-listings?companyId=${companyId}&page=${page}&limit=${limit}`, {
      next: { revalidate: 60 },
      headers: { cookie: cookieHeaders },
    });
    if (productsRes.ok) {
      const productsData = (await productsRes.json()).data;
      initialProducts = productsData.results || [];
      totalPages = productsData.meta?.totalPages || 1;
    } else {
      console.error(`Failed to fetch products: ${productsRes.status} ${productsRes.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  return (
    <AdminPOSClient
      companyId={companyId}
      initialCompanyInfo={initialCompanyInfo}
      initialStaff={initialStaff}
      initialCategories={initialCategories}
      initialProducts={initialProducts}
      userId={session?.user?.id || null}
      userName={userName}
      totalPages={totalPages}
      currentPage={parseInt(page)}
    />
  );
}