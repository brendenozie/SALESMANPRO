// app/admin/[slug]/users/page.tsx
import React from "react";
import UsersClient from "./UsersClient";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const prisma = new PrismaClient();

// Updated UserItem interface to reflect the new data structure from the query
interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'USER' | 'AGENT' | 'CONSUMER' | 'STAFF' | 'WRITER' | 'FRESHMAN' | 'SOPHOMORE' | 'SENIOR' | 'JUNIOR' | 'PARENT' | 'HEADTEACHER' | 'EDUCATOR' | 'STUDENT' | 'CLIENT';
  // 'plan' and 'status' are now strings from the Subscription model.
  plan: string | null;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIALING' | null;
  emailVerified: boolean | null;
  lastLogin: string | null;
  createdAt: string;
  profilePicture: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>; // companyId
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    plan?: string;
  }>;
}

export default async function UsersPage({ params, searchParams }: PageProps) {

  const { slug }  = await params;
    
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  const {
    page: pageStr,
    limit: limitStr,
    search: searchTerm = "",
    status: filterStatus,
    plan: filterPlan,
  } = await searchParams;

  const page = parseInt(pageStr || "1", 10);
  const limit = parseInt(limitStr || "10", 10);

  const skip = (page - 1) * limit;

  // Build the WHERE clause for the Prisma query
  const where: any = {
    // companyId: companyId,
    // search by name or email
    OR: [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ],
  };

  // NEW: Adjust filter logic to target the nested Subscription model
  if (filterStatus) {
    where.subscription = {
      status: filterStatus
    };
  }
  // NEW: Adjust filter logic to target the nested Plan model
  if (filterPlan) {
    where.subscription = {
      ...where.subscription, // Merge with existing subscription filters if any
      plan: {
        name: filterPlan
      }
    };
  }

  try {
    const [usersData, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        // NEW: Include the Subscription and nested Plan model
        include: {
          Subscription: {
            include: {
              plan: true
            }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // Map the Prisma model to your UserItem interface
    const formattedUsers: UserItem[] = usersData.map(user => ({
      id: user.id,
      companyId: user.companyId!,
      name: user.name || "N/A",
      email: user.email!,
      // NEW: Get plan and status from the first subscription object (if any)
      plan: user.Subscription?.[0]?.plan?.name || "N/A",
      status: (user.Subscription?.[0]?.status as UserItem['status']) || null,
      lastLogin: user.lastLogin?.toISOString() || null,
      createdAt: user.createdAt?.toISOString() || "",
      role: user.role as UserItem['role'],
      emailVerified: Boolean(user.emailVerified),
      profilePicture: user.profilePicture,
    }));

    return (
      <UsersClient
        companyId={companyId}
        users={formattedUsers}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={page}
        perPage={limit}
      />
    );
  } catch (err: any) {
    console.error("[UsersPage] Error fetching data:", err.message);
    // You can return an error state or an empty list
    return (
      <UsersClient
        companyId={companyId}
        users={[]}
        totalItems={0}
        totalPages={0}
        currentPage={page}
        perPage={limit}
      />
    );
  }
}
