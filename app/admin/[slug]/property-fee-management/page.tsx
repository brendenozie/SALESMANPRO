import { redirect } from "next/navigation";
import prisma from "@/server/db/prismadb";
// Replace this with however you get your authenticated user in Server Components
// import { getCurrentUser } from "@/lib/auth/getCurrentUser"; 
import FeeManagementClient from "./FeeManagementClient";
import { cookies } from "next/headers";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FeeManagementPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();
  // 1. Secure the route and get the company ID
  // const user = await getCurrentUser();
  
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

  // if (!user || !user.companyId) {
  //   redirect("/login");
  // }

  // const companyId = user.companyId;

  // 2. Run all database queries in parallel for maximum performance
  const [rawFees, activeMembers, rooms] = await Promise.all([
    // Fetch all fees with their nested relations
    prisma.hostelFee.findMany({
      where: { companyId },
      include: {
        hostelMember: {
          include: {
            student: true, // Assuming the member links to a Student model with a name
            consumer:{ select: { id: true,  user: { select: { name: true } } } } // For wallet top-up option in modal
          }
        },
        room: true,
      },
      orderBy: { dueDate: 'desc' },
    }),

    // Fetch active members to populate the modal dropdown
    prisma.hostelMember.findMany({
      where: { 
        companyId,
        status: "ACTIVE" // Only allow billing active tenants
      },
      include: {
        student: true,
        consumer:{ select: { id: true, user: { select: { name: true } } } } // For wallet top-up option in modal
      },
      orderBy: { createdAt: 'desc' }
    }),

    // Fetch available rooms for the modal dropdown
    prisma.hostelRoom.findMany({
      where: { 
          block: { companyId }
       },
      orderBy: { roomNumber: 'asc' }
    })
  ]);

  // 3. Transform the fees array to match the Client Component's expected shape
  const initialFees = rawFees.map((fee) => ({
    id: fee.id,
    invoiceNumber: fee.invoiceNumber, // Ensure your schema has this, or generate it
    studentName: fee.hostelMember?.consumer?.user?.name || "N/A",
    room: fee.room,
    rentAmount: fee.rentAmount || 0,
    messAmount: fee.messAmount || 0,
    totalAmount: fee.totalAmount,
    amountPaid: fee.amountPaid || 0,
    dueDate: fee.dueDate,
    status: fee.status,
  }));

  // 4. Calculate Analytics server-side
  const analytics = rawFees.reduce(
    (acc, fee) => {
      acc.expectedRevenue += fee.totalAmount;
      
      if (fee.status !== "PAID") {
        acc.totalOutstanding += (fee.totalAmount - fee.amountPaid);
        acc.outstandingCount += 1;
      } else {
        acc.collectedAmount += fee.totalAmount;
      }
      return acc;
    },
    { expectedRevenue: 0, totalOutstanding: 0, outstandingCount: 0, collectedAmount: 0 }
  );

  // Calculate Collection Rate percentage safely
  const collectionRate = analytics.expectedRevenue > 0 
    ? ((analytics.collectedAmount / analytics.expectedRevenue) * 100).toFixed(1) 
    : 0;

  const formattedAnalytics = {
    expectedRevenue: analytics.expectedRevenue,
    totalOutstanding: analytics.totalOutstanding,
    outstandingCount: analytics.outstandingCount,
    collectionRate: Number(collectionRate),
  };

  // 5. Pass cleanly to the Client Component
  return (
    <FeeManagementClient 
      companyId={companyId}
      initialFees={initialFees}
      analytics={formattedAnalytics}
      activeMembers={activeMembers}
      rooms={rooms}
    />
  );
}