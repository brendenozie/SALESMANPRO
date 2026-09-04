import React from "react";
import SuperAdminEmailClient from "./SuperAdminEmailClient";

export const metadata = {
  title: "Email Infrastructure Control Center - Super Admin",
  description: "Platform-wide email observability, dispatch metrics, and provider management",
};

export default function SuperAdminEmailPage() {
  return <SuperAdminEmailClient />;
}
