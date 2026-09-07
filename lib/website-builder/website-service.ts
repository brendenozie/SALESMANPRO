/**
 * lib/website-builder/website-service.ts
 *
 * Server-side data service for managing Website instances, drafts,
 * atomic publishing, revision histories, rollback, and cache invalidation.
 */

import prisma from "@/server/db/prismadb";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  CompiledWebsiteConfig,
  CompiledWebsiteConfigSchema,
} from "@/types/website-builder";
import { compileWebsiteFromCompany } from "./template-compiler";
import { resolveCanonicalTemplate } from "./template-registry";

/**
 * Get or automatically synthesize a tenant's editable Website configuration.
 * Guarantees zero-friction migration for existing stores.
 */
export async function getOrCreateWebsite(companySlugOrId: string): Promise<{
  website: any;
  config: CompiledWebsiteConfig;
  isNew: boolean;
}> {
  // 1. Fetch Company with all necessary relations for compilation
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { id: companySlugOrId.length === 24 ? companySlugOrId : undefined },
        { slug: companySlugOrId },
      ],
    },
    include: {
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: { include: { author: true } },
      heroSlides: true,
      promotions: true,
      CoreValues: true,
      addresses: true,
      SEO: true,
      website: true,
    },
  });

  if (!company) {
    throw new Error(`Company '${companySlugOrId}' not found.`);
  }

  // Deterministically resolve canonical template for this tenant
  const canonical = resolveCanonicalTemplate(
    company.category,
    company.variant,
    company.website?.templateKey
  );

  // 2. If Website already exists, return draftConfig or publishedConfig
  if (company.website) {
    const rawConfig = company.website.draftConfig || company.website.publishedConfig;
    if (rawConfig) {
      try {
        const parsed = CompiledWebsiteConfigSchema.parse(rawConfig);

        let needsDbSync = false;

        // If parsed.templateKey is missing or mismatched with canonical, migrate it
        if (!parsed.templateKey || parsed.templateKey !== canonical.id) {
          parsed.templateKey = canonical.id;
          needsDbSync = true;
        }

        // If website.templateKey is not canonical, sync it
        if (company.website.templateKey !== canonical.id) {
          needsDbSync = true;
        }

        if (needsDbSync) {
          await prisma.website.update({
            where: { id: company.website.id },
            data: {
              templateKey: canonical.id,
              draftConfig: parsed as any,
            },
          });
          company.website.templateKey = canonical.id;
        }

        return {
          website: company.website,
          config: parsed,
          isNew: false,
        };
      } catch (err) {
        console.warn("Stored website config was malformed, regenerating...", err);
      }
    }
  }

  // 3. Otherwise, run the compiler to create the initial website
  const compiledConfig = compileWebsiteFromCompany(company);
  compiledConfig.templateKey = canonical.id;


  // Save to database
  const createdWebsite = await prisma.website.upsert({
    where: { companyId: company.id },
    create: {
      companyId: company.id,
      name: company.name || "Store Website",
      templateKey: compiledConfig.templateKey,
      theme: compiledConfig.theme as any,
      navigation: compiledConfig.navigation as any,
      draftConfig: compiledConfig as any,
      publishedConfig: compiledConfig as any,
      status: "PUBLISHED",
      publishedAt: new Date(),
      revisions: {
        create: {
          companyId: company.id,
          versionNumber: 1,
          changeSummary: "Initial automatic template migration from store profile",
          source: "MIGRATION",
          snapshot: compiledConfig as any,
        },
      },
    },
    update: {
      draftConfig: compiledConfig as any,
      publishedConfig: compiledConfig as any,
      theme: compiledConfig.theme as any,
      navigation: compiledConfig.navigation as any,
    },
  });

  return {
    website: createdWebsite,
    config: compiledConfig,
    isNew: true,
  };
}

/**
 * Get the cached, published website configuration for public storefront rendering.
 */
export async function getPublishedWebsiteConfig(companySlug: string): Promise<CompiledWebsiteConfig | null> {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
      select: {
        id: true,
        website: {
          select: {
            publishedConfig: true,
            status: true,
          },
        },
      },
    });

    if (!company?.website?.publishedConfig) {
      return null;
    }

    return CompiledWebsiteConfigSchema.parse(company.website.publishedConfig);
  } catch (err) {
    console.error(`Error loading published website config for ${companySlug}:`, err);
    return null;
  }
}

/**
 * Save working changes to the tenant's draft configuration.
 */
export async function saveWebsiteDraft(
  companyId: string,
  draftConfig: CompiledWebsiteConfig,
  userId?: string
): Promise<CompiledWebsiteConfig> {
  // Validate schema before saving
  const validated = CompiledWebsiteConfigSchema.parse(draftConfig);

  await prisma.website.update({
    where: { companyId },
    data: {
      templateKey: validated.templateKey,
      draftConfig: validated as any,
      theme: validated.theme as any,
      navigation: validated.navigation as any,
      updatedAt: new Date(),
    },
  });

  return validated;
}

/**
 * Publish the current draft configuration atomically.
 * Updates publishedConfig, creates a new WebsiteRevision, and busts storefront cache.
 */
export async function publishWebsite(
  companyId: string,
  changeSummary = "Published website updates",
  userId?: string
): Promise<{
  publishedConfig: CompiledWebsiteConfig;
  versionNumber: number;
}> {
  const website = await prisma.website.findUnique({
    where: { companyId },
    include: {
      company: { select: { slug: true } },
      revisions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!website || !website.draftConfig) {
    throw new Error("No draft website configuration found to publish.");
  }

  // Validate the draft config
  const validatedConfig = CompiledWebsiteConfigSchema.parse(website.draftConfig);
  validatedConfig.publishedAt = new Date().toISOString();

  const nextVersion = (website.revisions?.[0]?.versionNumber || 0) + 1;

  // Atomic database transaction
  await prisma.$transaction([
    prisma.website.update({
      where: { companyId },
      data: {
        templateKey: validatedConfig.templateKey,
        publishedConfig: validatedConfig as any,
        status: "PUBLISHED",
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.websiteRevision.create({
      data: {
        websiteId: website.id,
        companyId,
        versionNumber: nextVersion,
        changeSummary,
        source: "MANUAL",
        snapshot: validatedConfig as any,
        publishedBy: userId || null,
      },
    }),
  ]);

  // Invalidate Next.js cache for this tenant's storefront
  if (website.company?.slug) {
    try {
      revalidatePath(`/site/${website.company.slug}`);
      revalidatePath(`/site/${website.company.slug}/[...pageSlug]`);
      revalidatePath(`/${website.company.slug}`);
      revalidatePath(`/${website.company.slug}/[...pageSlug]`);
    } catch (e) {
      // Ignore during build / SSR edge
    }
  }

  return {
    publishedConfig: validatedConfig,
    versionNumber: nextVersion,
  };
}

/**
 * Fetch revision history for a website.
 */
export async function getWebsiteRevisions(companyId: string) {
  return prisma.websiteRevision.findMany({
    where: { companyId },
    orderBy: { versionNumber: "desc" },
    take: 20,
    select: {
      id: true,
      versionNumber: true,
      changeSummary: true,
      source: true,
      publishedBy: true,
      createdAt: true,
    },
  });
}

/**
 * Restore a past snapshot to the draft.
 */
export async function rollbackWebsiteRevision(
  companyId: string,
  revisionId: string,
  userId?: string
): Promise<CompiledWebsiteConfig> {
  const revision = await prisma.websiteRevision.findFirst({
    where: { id: revisionId, companyId },
  });

  if (!revision || !revision.snapshot) {
    throw new Error("Revision snapshot not found.");
  }

  const restoredConfig = CompiledWebsiteConfigSchema.parse(revision.snapshot);

  await saveWebsiteDraft(companyId, restoredConfig, userId);

  return restoredConfig;
}
