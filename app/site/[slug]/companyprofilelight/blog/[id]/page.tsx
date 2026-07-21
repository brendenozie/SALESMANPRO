import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import { cacheGet, cacheSet } from "@/lib/cache";
import BlogReaderClient from "./BlogReaderClient";
import { findCompanyCached } from "@/lib/company-fetcher";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{ slug: string, id: string }>;
}

async function getBlogRecord(slug: string, id: string) {
  const cacheKey = `public:blog-detail:${slug}:${id}`;
  const cookieHeader = (await cookies()).toString();
  
    // const baseCompany = await findCompanyCached(slug, "lean");
    //   if (!baseCompany) notFound();
    
  
  // 1. Check cache tier
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
  } catch (e) {}

  // 2. Query storage tier
  const blog = await prisma.blog.findFirst({
    where: { 
      slug:id,
      // companyId: baseCompany.id,
      // status: "PUBLISHED" // Protect pipeline against drafting states
    },
    include: {
      seo: true,
    }
  });

  if (!blog) return null;

  // 3. Increment metric tracking side effect safely asynchronously
  // try {
  //   await prisma.blog.update({
  //     where: { id: blog.id },
  //     // data: { views: { increment: 1 } }
  //   });
  // } catch (e) {
  //   console.error("[BlogReaderServer] Failed to bump metric telemetry:", e);
  // }

  // 4. Hydrate cache layer
  try {
    await cacheSet(cacheKey, blog, 300); // 5 minute validation ring
  } catch (e) {}

  return blog;
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug, id } = await params;
  const blog = await getBlogRecord(slug, id);

  if (!blog) {
    notFound();
  }

  // Formatting strings cleanly prior to serialization transmission to client boundaries
  const serializedBlog = {
    ...blog,
    createdAt: blog.createdAt?.toISOString() || null,
    updatedAt: blog.updatedAt?.toISOString() || null,
    publishedAt: blog.publishedAt ? blog.publishedAt?.toISOString() : null,
  };

  return <BlogReaderClient blog={serializedBlog} />;
}