// app/admin/targets/page.tsx

import React from "react";
import TargetsClient from "./TargetsClient";

/**
 * Server Component that simply renders the client‐side logic.
 * All data fetching and rendering happen in TargetsClient.
 */
export default function TargetsPage() {
  return <TargetsClient />;
}
