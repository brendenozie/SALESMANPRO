import { cookies } from "next/headers";
import LibraryBooksClient from "./LibraryBooksClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LibraryBooksPage({ params }: PageProps) {
  const { slug: schoolId } = await params;
  const cookieHeader = (await cookies()).toString();

  let initialBooks = [];

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/library/books?companyId=${schoolId}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      initialBooks = (await res.json()).data;
      console.log(initialBooks);
    }
  } catch (err) {
    console.error("[LibraryBooksPage] Failed to load books", err);
  }

  return (
    <LibraryBooksClient
      initialBooks={initialBooks}
      schoolId={schoolId}
    />
  );
}