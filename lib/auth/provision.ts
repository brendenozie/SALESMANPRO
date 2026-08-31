import prisma from "@/server/db/prismadb";
import type { AuthFlowContext } from "./context";
import { classifyHost, isBusinessAdminSignupKind, isStorefrontSignupKind } from "./domain";

export type ProvisionResult = {
  role: "ADMIN" | "USER";
  companyId: string | null;
  consumerCreated: boolean;
};

async function findTenantCompany(ctx: AuthFlowContext) {
  const host = ctx.returnHost;
  const slug = ctx.tenantSlug;
  const classified = classifyHost(host);

  return prisma.company.findFirst({
    where: {
      OR: [
        { domain: host },
        { domain: `www.${host}` },
        ...(slug ? [{ slug }, { domain: slug }] : []),
        ...(classified.kind === "ghuba" ? [{ slug: "ghuba" }, { domain: "ghuba.shop" }] : []),
      ],
    },
    select: { id: true, slug: true, domain: true, userId: true },
  });
}

/**
 * Link a consumer row without changing User.role.
 * Existing consumer/company links are left intact (one consumer profile per user in current schema).
 */
export async function ensureConsumerForCompany(userId: string, companyId: string): Promise<boolean> {
  const existing = await prisma.consumer.findUnique({
    where: { userId },
    select: { id: true, companyId: true },
  });

  if (!existing) {
    await prisma.consumer.create({
      data: { userId, companyId },
    });
    return true;
  }

  if (!existing.companyId) {
    await prisma.consumer.update({
      where: { userId },
      data: { companyId },
    });
    return false;
  }

  return false;
}

export async function initialRoleForSignup(ctx: AuthFlowContext): Promise<"ADMIN" | "USER"> {
  if (isBusinessAdminSignupKind(ctx.kind)) return "ADMIN";
  return "USER";
}

export async function provisionSignupRelationships(
  userId: string,
  ctx: AuthFlowContext,
  options?: { isNewUser?: boolean; existingRole?: string | null },
): Promise<ProvisionResult> {
  const isNew = options?.isNewUser !== false;
  let role: "ADMIN" | "USER" = "USER";

  if (isNew && isBusinessAdminSignupKind(ctx.kind)) {
    role = "ADMIN";
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    });
  } else if (isNew) {
    role = "USER";
  }

  let companyId: string | null = null;
  let consumerCreated = false;

  if (isStorefrontSignupKind(ctx.kind)) {
    const company = await findTenantCompany(ctx);
    if (company) {
      companyId = company.id;
      consumerCreated = await ensureConsumerForCompany(userId, company.id);
    }
  }

  return { role: isNew ? role : ((options?.existingRole as "ADMIN" | "USER") || "USER"), companyId, consumerCreated };
}

/**
 * Existing identities keep their established account role.
 * Store/Ghuba logins may still attach a consumer relationship.
 */
export async function applyLoginContext(userId: string, ctx: AuthFlowContext | null) {
  if (!ctx || !isStorefrontSignupKind(ctx.kind)) return;
  const company = await findTenantCompany(ctx);
  if (company) {
    await ensureConsumerForCompany(userId, company.id);
  }
}
