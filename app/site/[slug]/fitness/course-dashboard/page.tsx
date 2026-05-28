// app/site/[slug]/fitness/course-dashboard/page.tsx

import MemberDashboardClient from "./MemberDashboardClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MemberDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  return <MemberDashboardClient  />;
}