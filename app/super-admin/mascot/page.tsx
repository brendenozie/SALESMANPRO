import React from "react";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import SuperAdminMascotClient from "./SuperAdminMascotClient";

export const metadata = {
  title: "Mascot & Agents Control Center | Super Admin Console",
  description: "Platform-wide background task orchestration, worker telemetry, and integration policy.",
};

export default async function SuperAdminMascotPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/super-admin/mascot");
  }

  const role = ((session.user as any).role || "").toUpperCase();
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    redirect("/unauthorized?reason=super_admin_required");
  }

  return (
    <div className="flex-1 p-6 md:p-10 bg-slate-950 min-h-screen text-slate-100 overflow-y-auto">
      <SuperAdminMascotClient />
    </div>
  );
}
