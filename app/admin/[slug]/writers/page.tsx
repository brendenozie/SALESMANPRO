// app/admin/[companyId]/writers/page.tsx
import React from "react";
import WritersClient from "./WritersClient"; // Make sure the path is correct

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define nested types for User and Company as they will be included by Prisma
export type UserForWriter = {
  id: string;
  name: string | null;
  email: string;
  // Add other User fields from your schema if you need to display them
};

export type CompanyForWriter = {
  id: string;
  name: string;
  // Add other Company fields from your schema if you need to display them
};

// ✨ Updated Writer type to reflect the full structure from the API
export type Writer = {
  id: string;
  userId: string;
  user: UserForWriter; // User object is now included
  companyId: string;
  company: CompanyForWriter; // Company object is now included
  phone: string | null;
  bio: string | null;
  address: string | null;
  profilePicture: string | null;
  loginCode: string; // As per schema, it's not optional
  totalArticles: number;
  articlesThisMonth: number;
  lastArticleDate: string | null; // Date of their last published article (ISO string)
  status: string; // 'Active' | 'Inactive' | 'On Leave'
  createdAt: string; // DateTime returned as ISO string
  updatedAt: string; // DateTime returned as ISO string
};

interface PageProps {
  params: {
    slug: string; // This is the companyId (or blogId)
  };
}

/**
 * Server Component: fetches writers and passes the companyId and data
 * to the client component.
 */
export default async function WritersPage({ params }: PageProps) {
  const companyId = params.slug;
  let writersData: Writer[] = [];

  try {
    const res = await fetch(`${apiUrl}/admin/writers?companyId=${companyId}`, {
      cache: "no-store", // Ensure fresh data on each request
    });
    if (res.ok) {
      // The API now returns the full Writer structure including nested user and company.
      // We cast rawData directly to Writer[] for type safety.
      const rawData: Writer[] = await res.json(); 

      // It's good practice to map and provide default values for robustness,
      // even if the API is expected to return all fields.
      writersData = rawData.map((writer: any) => ({
        ...writer,
        // Ensure all fields are present with sensible defaults if the API somehow omits them
        phone: writer.phone || null,
        bio: writer.bio || null,
        address: writer.address || null,
        profilePicture: writer.profilePicture || null,
        totalArticles: writer.totalArticles || 0,
        articlesThisMonth: writer.articlesThisMonth || 0,
        lastArticleDate: writer.lastArticleDate || null,
        status: writer.status || 'Active', // Default status as per schema
        loginCode: writer.loginCode || 'N/A', // loginCode is mandatory, but 'N/A' as fallback for display
        createdAt: writer.createdAt || new Date().toISOString(),
        updatedAt: writer.updatedAt || new Date().toISOString(),
        // Ensure nested objects are handled with fallbacks
        user: writer.user || { id: '', name: null, email: 'N/A' }, 
        company: writer.company || { id: '', name: 'N/A' }, 
      }));

    } else {
      console.error(
        "[WritersPage] Failed to fetch writers →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[WritersPage] Error fetching writers →", err.message);
  }

  // Pass companyId and fetched writers data to the client component
  return <WritersClient writersData={writersData} companyId={companyId} />;
}
