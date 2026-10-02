import React from "react";
import IntegrationsClient from "./IntegrationsClient";

export const metadata = {
  title: "Integrations & API Credential Control Center | SalesmanPro Super Admin",
  description:
    "Root authority dashboard for discovering, configuring, verifying, and deploying external service integrations.",
};

export default function IntegrationsPage() {
  return <IntegrationsClient />;
}
