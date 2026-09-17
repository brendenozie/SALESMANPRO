/**
 * lib/observability/serviceMonitor.ts
 *
 * External API and Dependency Health Checker.
 * Probes external dependencies with strict 3-second timeouts.
 */

import prisma from "@/server/db/prismadb";
import { ExternalServiceCheckSummary } from "./types";

interface ServiceProbeDef {
  serviceName: string;
  displayName: string;
  category: "auth" | "payment" | "communication" | "ai" | "storage" | "cdn";
  probeUrl: string;
  expectedStatuses: number[];
}

const EXTERNAL_SERVICES: ServiceProbeDef[] = [
  {
    serviceName: "google_oauth",
    displayName: "Google OAuth 2.0",
    category: "auth",
    probeUrl: "https://accounts.google.com/.well-known/openid-configuration",
    expectedStatuses: [200],
  },
  {
    serviceName: "meta_whatsapp",
    displayName: "Meta / WhatsApp Cloud API",
    category: "communication",
    probeUrl: "https://graph.facebook.com",
    expectedStatuses: [200, 400, 401],
  },
  {
    serviceName: "daraja_mpesa",
    displayName: "Safaricom M-Pesa / Daraja",
    category: "payment",
    probeUrl: "https://api.safaricom.co.ke",
    expectedStatuses: [200, 403, 404],
  },
  {
    serviceName: "paystack",
    displayName: "Paystack Payment Gateway",
    category: "payment",
    probeUrl: "https://api.paystack.co",
    expectedStatuses: [200, 401, 404],
  },
  {
    serviceName: "stripe",
    displayName: "Stripe Gateway",
    category: "payment",
    probeUrl: "https://api.stripe.com",
    expectedStatuses: [200, 401, 404],
  },
  {
    serviceName: "paypal",
    displayName: "PayPal Gateway",
    category: "payment",
    probeUrl: "https://api.paypal.com",
    expectedStatuses: [200, 401, 403, 404],
  },
  {
    serviceName: "groq_ai",
    displayName: "Groq LPU Inference",
    category: "ai",
    probeUrl: "https://api.groq.com/openai/v1/models",
    expectedStatuses: [200, 401],
  },
  {
    serviceName: "openai",
    displayName: "OpenAI Platform",
    category: "ai",
    probeUrl: "https://api.openai.com/v1/models",
    expectedStatuses: [200, 401],
  },
];

export async function probeExternalServices(): Promise<ExternalServiceCheckSummary[]> {
  const results = await Promise.all(
    EXTERNAL_SERVICES.map(async (svc) => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(svc.probeUrl, {
          method: "GET",
          signal: controller.signal,
          headers: { "User-Agent": "SalesmanPro-Observability/1.0" },
        }).catch((err) => {
          throw err;
        });

        clearTimeout(timeoutId);
        const latencyMs = Date.now() - start;
        const isAvailable = svc.expectedStatuses.includes(res.status) || res.status < 500;

        const checkResult: ExternalServiceCheckSummary = {
          serviceName: svc.serviceName,
          displayName: svc.displayName,
          category: svc.category,
          isAvailable,
          latencyMs,
          statusCode: res.status,
          lastCheckedAt: new Date().toISOString(),
        };

        // Asynchronously update database record
        prisma.monitoringExternalServiceCheck.upsert({
          where: { serviceName: svc.serviceName },
          create: {
            serviceName: svc.serviceName,
            isAvailable,
            latencyMs,
            statusCode: res.status,
            lastCheckedAt: new Date(),
          },
          update: {
            isAvailable,
            latencyMs,
            statusCode: res.status,
            lastCheckedAt: new Date(),
          },
        }).catch(() => {});

        return checkResult;
      } catch (err: any) {
        const latencyMs = Date.now() - start;
        const checkResult: ExternalServiceCheckSummary = {
          serviceName: svc.serviceName,
          displayName: svc.displayName,
          category: svc.category,
          isAvailable: false,
          latencyMs,
          errorMessage: err?.name === "AbortError" ? "Probe request timed out (>3000ms)" : err.message,
          lastCheckedAt: new Date().toISOString(),
        };

        prisma.monitoringExternalServiceCheck.upsert({
          where: { serviceName: svc.serviceName },
          create: {
            serviceName: svc.serviceName,
            isAvailable: false,
            latencyMs,
            errorMessage: checkResult.errorMessage,
            lastCheckedAt: new Date(),
          },
          update: {
            isAvailable: false,
            latencyMs,
            errorMessage: checkResult.errorMessage,
            lastCheckedAt: new Date(),
          },
        }).catch(() => {});

        return checkResult;
      }
    }),
  );

  return results;
}
