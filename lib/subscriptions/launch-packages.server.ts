/**
 * Server-only helpers for Done-For-You launch packages.
 * Kept separate from subscription-plans.ts because that module is imported by client components.
 */
import prisma from "@/server/db/prismadb";
import {
  LAUNCH_INCLUDED_PLAN_ID,
  LAUNCH_INCLUDED_PLAN_NAMES,
} from "@/lib/subscriptions/subscription-plans";

/**
 * Resolves the DB plan that a launch package grants (Starter Store).
 * Never falls back to an arbitrary plan, to avoid granting a higher tier by accident.
 */
export async function resolveLaunchIncludedPlan() {
  const byId = await prisma.plan.findUnique({ where: { id: LAUNCH_INCLUDED_PLAN_ID } }).catch(() => null);
  if (byId) return byId;
  return prisma.plan.findFirst({ where: { name: { in: LAUNCH_INCLUDED_PLAN_NAMES } } });
}

