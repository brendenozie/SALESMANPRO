import { Metadata } from "next";
import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";
import TargetsChart from "./TargetsChart";

const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

export const metadata: Metadata = {
  title: "Sales Targets | Salesman Pro",
  description: "View and track your sales performance targets",
};

interface TargetPageProps {
  params: Promise<{
    salesAgentId: string;
  }>;
}

export default async function TargetPage({ params }: TargetPageProps) {
  const { salesAgentId } = await params;

  const res = await fetch(`${apiBaseUrl}/agent/targets?salesAgentId=${salesAgentId}`, {
    cache: "no-store", // ensures fresh data every time
  });

  if (!res.ok) {
    throw new Error("Failed to fetch targets");
  }

  const data = await res.json();

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen w-full">
        <UserNav />
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Sales Targets
          </h1>
          <TargetsChart targets={data} />
        </div>
      </div>
    </UserLayout>
  );
}
