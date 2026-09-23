import React from "react";
import TeachersAttendancePage from "./TeachersAttendancePage";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TeacherAttendancePage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <TeachersAttendancePage />
  );
}
