import prisma from "../server/db/prismadb";

async function runReadOnlyAudit() {
  console.log("=== STARTING READ-ONLY AUDIT FOR brendenozie@gmail.com ===");

  try {
    // 1. Find user
    const user = await prisma.user.findFirst({
      where: { email: { equals: "brendenozie@gmail.com", mode: "insensitive" } },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      console.log("User brendenozie@gmail.com not found in User collection.");
      return;
    }

    console.log(`User found: ${user.name} (${user.email}) - ID: ${user.id}`);

    // 2. Find stores owned by this user
    const stores = await prisma.company.findMany({
      where: {
        userId: user.id,
      },
      include: {
        website: {
          select: {
            id: true,
            templateKey: true,
            theme: true,
            status: true,
            publishedAt: true,
            draftConfig: true,
            publishedConfig: true,
          },
        },
        Product: {
          select: {
            id: true,
            name: true,
            category: true,
            subCategoryName: true,
            brand: true,
            productCategoryId: true,
            sellingPrice: true,
            quantity: true,
            isAvailable: true,
            showOnGhuba: true,
          },
        },
        marketplaceListings: {
          select: {
            id: true,
            productId: true,
            name: true,
            category: true,
            subCategoryName: true,
            brand: true,
            productCategoryId: true,
            sellingPrice: true,
            quantity: true,
            isAvailable: true,
            status: true,
            showOnGhuba: true,
            ghubaStatus: true,
          },
        },
      },
    });

    console.log(`\nFound ${stores.length} store(s) owned by brendenozie@gmail.com:\n`);

    const auditResults = {
      critical: [] as string[],
      high: [] as string[],
      medium: [] as string[],
      low: [] as string[],
      healthy: [] as string[],
    };

    for (const store of stores) {
      console.log(`--- Store: "${store.name}" (${store.slug}) [ID: ${store.id}] ---`);
      console.log(`    Category: "${store.category}", Variant: "${store.variant}", Origin: "${store.storeOrigin}", ShowOnGhuba: ${store.showOnGhuba}`);
      
      let storeHasIssues = false;

      // Store Variant check
      if (!store.variant) {
        storeHasIssues = true;
        auditResults.high.push(`Store "${store.name}" (${store.slug}): Missing variant.`);
      }

      // Website check
      if (!store.website) {
        storeHasIssues = true;
        auditResults.high.push(`Store "${store.name}" (${store.slug}): Missing website record.`);
      } else {
        console.log(`    Website: TemplateKey="${store.website.templateKey}", Status="${store.website.status}"`);
        if (!store.website.templateKey) {
          storeHasIssues = true;
          auditResults.high.push(`Store "${store.name}" (${store.slug}): Website has no templateKey.`);
        }
      }

      console.log(`    Products: ${store.Product.length}, Marketplace Listings: ${store.marketplaceListings.length}`);

      // Product and Listing relationship checks
      const productById = new Map<string, typeof store.Product[0]>();

      for (const p of store.Product) {
        productById.set(p.id, p);
        if (!p.productCategoryId && !p.category) {
          storeHasIssues = true;
          auditResults.medium.push(`Product "${p.name}" (${p.id}) in store "${store.slug}": Missing both productCategoryId and category string.`);
        }
      }

      for (const l of store.marketplaceListings) {
        if (!l.productId) {
          storeHasIssues = true;
          auditResults.critical.push(`Listing "${l.name}" (${l.id}) in store "${store.slug}": Missing productId (orphaned listing).`);
        } else {
          const srcProduct = productById.get(l.productId);
          if (!srcProduct) {
            storeHasIssues = true;
            auditResults.critical.push(`Listing "${l.name}" (${l.id}) in store "${store.slug}": References non-existent productId "${l.productId}".`);
          } else {
            // Check Price Consistency
            if (srcProduct.sellingPrice !== l.sellingPrice) {
              storeHasIssues = true;
              auditResults.medium.push(
                `Price divergence in "${store.slug}": Product "${srcProduct.name}" sellingPrice=${srcProduct.sellingPrice}, Listing sellingPrice=${l.sellingPrice}.`
              );
            }
            // Check Stock Consistency
            if (srcProduct.quantity !== l.quantity) {
              storeHasIssues = true;
              auditResults.medium.push(
                `Stock divergence in "${store.slug}": Product "${srcProduct.name}" qty=${srcProduct.quantity}, Listing qty=${l.quantity}.`
              );
            }
            // Check Category Consistency
            if (srcProduct.category !== l.category) {
              storeHasIssues = true;
              auditResults.low.push(
                `Category discrepancy in "${store.slug}": Product "${srcProduct.name}" category="${srcProduct.category}", Listing category="${l.category}".`
              );
            }
            // Check Brand Consistency
            if (srcProduct.brand !== l.brand) {
              storeHasIssues = true;
              auditResults.low.push(
                `Brand discrepancy in "${store.slug}": Product "${srcProduct.name}" brand="${srcProduct.brand}", Listing brand="${l.brand}".`
              );
            }
          }
        }
      }

      if (!storeHasIssues) {
        auditResults.healthy.push(`Store "${store.name}" (${store.slug})`);
      }
    }

    console.log("\n=================== AUDIT SUMMARY ===================");
    console.log(`CRITICAL (${auditResults.critical.length}):`);
    auditResults.critical.forEach((msg) => console.log(`  - [CRITICAL] ${msg}`));

    console.log(`\nHIGH (${auditResults.high.length}):`);
    auditResults.high.forEach((msg) => console.log(`  - [HIGH] ${msg}`));

    console.log(`\nMEDIUM (${auditResults.medium.length}):`);
    auditResults.medium.forEach((msg) => console.log(`  - [MEDIUM] ${msg}`));

    console.log(`\nLOW (${auditResults.low.length}):`);
    auditResults.low.forEach((msg) => console.log(`  - [LOW] ${msg}`));

    console.log(`\nHEALTHY STORES (${auditResults.healthy.length}):`);
    auditResults.healthy.forEach((msg) => console.log(`  - [HEALTHY] ${msg}`));

    console.log("=====================================================");
  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runReadOnlyAudit();
