// app/admin/members/page.tsx
import React from "react";
import MembersClient from "./MembersClient";
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define a simplified User type for display in the members list
export type Member = {
  id: string;
  name: string | null;
  email: string;
  role: string | null; // Assuming ROLE enum is string in JS
  createdAt: string;
};

// Define Project and ProjectMember types for the AddProjectMemberForm
export type ProjectOption = {
  id: string;
  name: string;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  project: ProjectOption; // Include project name for display
  user: Member; // Include user details for display
  createdAt: string;
};


interface PageProps {
  params: {
    slug: string; // companyId
  };
}

/**
 * Server Component: fetches the members (users) and projects on every request,
 * then renders the client component with the fetched data.
 */
export default async function MembersPage({ params }: PageProps) {
  const companyId = params.slug;
  const cookieHeader = await cookies().toString();

  let membersData: Member[] = [];
  let projectsData: ProjectOption[] = [];
  let projectMembersData: ProjectMember[] = [];

  try {
    // Fetch Users (Members)
    // NOTE: You'll need an API endpoint for fetching users, e.g., /api/users
    // For now, this is a placeholder. You might need to adjust your backend to expose users.
    const usersRes = await fetch(`${apiUrl}/admin/users?companyId=${companyId}`, { cache: "no-store", headers: { cookie: cookieHeader } });
    if (usersRes.ok) {
      let data = await usersRes.json();
      membersData = data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })) as Member[];
    } else {
      console.error("[MembersPage] Failed to fetch users →", usersRes.status, usersRes.statusText);
    }

    // Fetch Projects (for Project Member dropdown)
    const projectsRes = await fetch(`${apiUrl}/admin/projects?companyId=${companyId}`, { cache: "no-store", headers: { cookie: cookieHeader } });
    if (projectsRes.ok) {
      let data = await projectsRes.json();
      projectsData = data.map((project: any) => ({
        id: project.id,
        name: project.name,
      })) as ProjectOption[];
    } else {
      console.error("[MembersPage] Failed to fetch projects →", projectsRes.status, projectsRes.statusText);
    }

    // Fetch Project Members
    const projectMembersRes = await fetch(`${apiUrl}/admin/project-members?companyId=${companyId}`, { cache: "no-store", headers: { cookie: cookieHeader } });
    if (projectMembersRes.ok) {
      let data = await projectMembersRes.json();
      projectMembersData = data.map((pm: any) => ({
        id: pm.id,
        projectId: pm.projectId,
        userId: pm.userId,
        role: pm.role,
        project: { id: pm.project.id, name: pm.project.name },
        user: {
          id: pm.user.id,
          name: pm.user.name,
          email: pm.user.email,
          role: pm.user.role,
          createdAt: pm.user.createdAt,
        },
      })) as ProjectMember[];
    } else {
      console.error("[MembersPage] Failed to fetch project members →", projectMembersRes.status, projectMembersRes.statusText);
    }

  } catch (err: any) {
    console.error("[MembersPage] Error fetching data for members page →", err.message);
  }

  return <MembersClient membersData={membersData} projectsData={projectsData} projectMembersData={projectMembersData} />;
}
