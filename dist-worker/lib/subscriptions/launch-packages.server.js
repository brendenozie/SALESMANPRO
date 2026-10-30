"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLaunchIncludedPlan = void 0;
/**
 * Server-only helpers for Done-For-You launch packages.
 * Kept separate from subscription-plans.ts because that module is imported by client components.
 */
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const subscription_plans_1 = require("@/lib/subscriptions/subscription-plans");
/**
 * Resolves the DB plan that a launch package grants (Starter Store).
 * Never falls back to an arbitrary plan, to avoid granting a higher tier by accident.
 */
async function resolveLaunchIncludedPlan() {
    const byId = await prismadb_1.default.plan.findUnique({ where: { id: subscription_plans_1.LAUNCH_INCLUDED_PLAN_ID } }).catch(() => null);
    if (byId)
        return byId;
    return prismadb_1.default.plan.findFirst({ where: { name: { in: subscription_plans_1.LAUNCH_INCLUDED_PLAN_NAMES } } });
}
exports.resolveLaunchIncludedPlan = resolveLaunchIncludedPlan;
