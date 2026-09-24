import PayrollManagementClient from "./PayrollManagementClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
import prisma from "@/server/db/prismadb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PayrollManagementSSRPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  const companyId = company.id;
  const month = new Date().getMonth() + 1;

  let initialData: any[] = []; 
  let initialStaff: any[] = []; 

  try {
    const staffMembers = await prisma.staffProfile.findMany({
      where: { companyId },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } }
    });

    initialData = staffMembers.map(staff => {
      const baseSalary = staff.salary || 0;
      const tax = baseSalary * 0.15;
      const net = baseSalary - tax;

      return {
        id: `PAY-${staff.id.slice(-6)}-${month}`,
        staff: staff.user?.name || "Staff Member",
        base: baseSalary,
        tax: tax,
        net: net,
        status: "CALCULATED",
        bankAccount: staff.bankAccount || "N/A",
        bankCode: staff.bankCode || "N/A"
      };
    });

    initialStaff = staffMembers.map(s => ({
      id: s.id,
      name: s.user?.name || "Staff Member",
      email: s.user?.email || "N/A",
      department: s.department || "General",
      salary: s.salary || 0,
      bankAccount: s.bankAccount,
      bankCode: s.bankCode,
    }));
  } catch (err) {
    console.error("[PayrollManagementSSRPage] Failed to query payroll", err);
  }

  return (
    <PayrollManagementClient
      initialData={initialData}
      initialStaff={initialStaff}
      companyId={companyId}
    />
  );
}