// app/admin/[slug]/users/page.tsx
import React from "react";
import UsersClient from "./UsersClient";

export interface UserItem {
  id: string;
  companyId: string;
  name: string;
  email: string;
  plan: string; // e.g., "Free", "Starter", "Pro", "Business"
  status: "Active" | "Inactive" | "Suspended";
  lastLogin: string | null;
  createdAt: string;
  role: "admin" | "user" | "moderator";
  emailVerified: boolean;
  avatarUrl: string | null;
}

interface PageProps {
  params: { slug: string }; // companyId
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    plan?: string;
  };
}

// Dummy data generation
const generateDummyUsers = (companyId: string, count: number): UserItem[] => {
  const users: UserItem[] = [];
  const plans = ["Free", "Starter", "Pro", "Business"];
  const statuses = ["Active", "Inactive", "Suspended"];
  const roles = ["user", "user", "user", "moderator", "admin"]; // More users than admins

  for (let i = 1; i <= count; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
    const lastLogin = Math.random() > 0.1 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null;
    const emailVerified = Math.random() > 0.2;
    const name = `User ${i} Name`;
    const email = `user${i}@example.com`;
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];

    users.push({
      id: `user-${i}-${companyId}`,
      companyId: companyId,
      name,
      email,
      plan,
      status: status as "Active" | "Inactive" | "Suspended",
      lastLogin,
      createdAt,
      role: role as "admin" | "user" | "moderator",
      emailVerified,
      avatarUrl: Math.random() > 0.5 ? `/images/avatars/user-avatar-${(i % 5) + 1}.jpg` : null, // Sample avatars
    });
  }
  return users;
};

export default async function UsersPage({ params, searchParams }: PageProps) {
  const companyId = params.slug;
  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "10");
  const searchTerm = searchParams.search || "";
  const filterStatus = searchParams.status || "";
  const filterPlan = searchParams.plan || "";

  const fetchUsers = async (
    currentPage: number,
    currentLimit: number,
    currentSearchTerm: string,
    currentStatus: string,
    currentPlan: string
  ) => {
    // Simulate API call
    const allDummyUsers = generateDummyUsers(companyId, 100); // 100 dummy users
    let filteredUsers = allDummyUsers.filter(user =>
      user.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(currentSearchTerm.toLowerCase())
    );

    if (currentStatus) {
      filteredUsers = filteredUsers.filter(user => user.status === currentStatus);
    }
    if (currentPlan) {
      filteredUsers = filteredUsers.filter(user => user.plan === currentPlan);
    }

    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = startIndex + currentLimit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      usersData: paginatedUsers,
      totalItems: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / currentLimit),
    };
  };

  let usersData: UserItem[] = [];
  let totalItems = 0;
  let totalPages = 0;

  try {
    ({ usersData, totalItems, totalPages } = await fetchUsers(
      page,
      limit,
      searchTerm,
      filterStatus,
      filterPlan
    ));
  } catch (err: any) {
    console.error("[UsersPage] Error fetching data:", err.message);
  }

  return (
    <UsersClient
      companyId={companyId}
      users={usersData}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      perPage={limit}
      refetchUsers={fetchUsers}
    />
  );
}