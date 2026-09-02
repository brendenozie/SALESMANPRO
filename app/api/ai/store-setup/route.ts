import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { aiService } from "@/lib/ai/aiService";
import { creditLedger } from "@/lib/ai/creditLedger";
import prisma from "@/server/db/prismadb";
import { AIPlatformError } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

const storeSetupSchema = z.object({
  businessDescription: z.string().min(5, "Please provide a brief description of your business idea"),
  businessCategory: z.string().optional(), // The store industry (from MainCategorySelect / siteCategories)
  categoryId: z.string().optional(),       // The database ProductCategory ID
  categoryName: z.string().optional(),
  industry: z.string().optional(),
  brandTone: z.string().optional(),
  targetAudience: z.string().optional(),
  currency: z.string().default("KES"),
});

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();
    const validated = storeSetupSchema.parse(body);

    const CREDIT_COST = 5;

    // Check balance
    const currentBalance = await creditLedger.getBalance(auth.companyId);
    if (currentBalance < CREDIT_COST) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient AI credits. You have ${currentBalance} credits, but Store Setup requires ${CREDIT_COST} credits. Please purchase a credit pack.`,
          balance: currentBalance,
          required: CREDIT_COST,
        },
        { status: 402 },
      );
    }

    // 1. Query existing ProductCategory records from database
    const dbCategories = await prisma.productCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subcategories: true,
        allBrands: true,
      },
      take: 60,
    });

    // Format DB categories for context injection
    const categoriesContext = dbCategories.map((c) => ({
      id: c.id,
      name: c.name,
      subcategories: Array.isArray(c.subcategories)
        ? (c.subcategories as any[])
            .map((s) => (typeof s === "object" ? s?.name || s?.title : String(s)))
            .filter(Boolean)
            .slice(0, 10)
        : [],
      brands: (c.allBrands || []).slice(0, 10),
    }));

    // Check if user pre-selected a valid category
    const preselectedCategory = validated.categoryId
      ? dbCategories.find((c) => c.id === validated.categoryId)
      : validated.categoryName
        ? dbCategories.find(
            (c) => c.name.toLowerCase() === validated.categoryName?.toLowerCase(),
          )
        : null;

    const selectedIndustry = validated.businessCategory || validated.industry || "Retail & Commerce";

    const systemPrompt = `You are SalesmanPro's Master eCommerce & Retail Business Architect.
You must factor in both the selected Store Business Category / Industry ("${selectedIndustry}") and the real database product categories already present in the system so that all products sync with the database product category catalog.

CRITICAL INSTRUCTIONS:
1. Ground the store setup in the selected store industry: "${selectedIndustry}".
2. Select/match ONE category from the provided DATABASE PRODUCT CATEGORIES list that best matches the store concept.
3. In the "matchedCategory", use the EXACT "id" and "name" from the database list.
4. If the database category already has subcategories, match relevant ones in "matchedExistingSubcategories".
5. Since each store has a separate StoreCategory model, recommend "newSubcategories" and "newBrands" that should be added to this store's custom StoreCategory.
6. In "starterProducts", each product's "categoryId" and "categoryName" MUST match the "matchedCategory".

DATABASE PRODUCT CATEGORIES PRESENT IN SYSTEM:
${JSON.stringify(categoriesContext, null, 2)}

Return ONLY valid JSON matching this schema:
{
  "name": "Catchy Brand Name",
  "tagline": "Compelling tagline",
  "description": "Rich 2-3 paragraph store bio and value proposition",
  "suggestedIndustry": "${selectedIndustry}",
  "matchedCategory": {
    "id": "exact_id_from_database_list",
    "name": "exact_name_from_database_list",
    "matchedExistingSubcategories": ["existing subcategory names"],
    "newSubcategories": ["new subcategory names to add to StoreCategory"],
    "newBrands": ["new brand names to add to StoreCategory"]
  },
  "currency": "${validated.currency}",
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "font": "Inter | Plus Jakarta Sans | Outfit"
  },
  "starterProducts": [
    {
      "name": "Product Name",
      "description": "Compelling product copy highlighting key benefits",
      "price": 1500,
      "categoryId": "exact_id_from_matchedCategory",
      "categoryName": "exact_name_from_matchedCategory",
      "subcategory": "Subcategory name",
      "brand": "Brand name",
      "tags": ["tag1", "tag2"]
    }
  ],
  "shipping": {
    "standardRate": 250,
    "expressRate": 500,
    "instructions": "Standard delivery takes 1-3 business days. Free pickup available."
  },
  "whatsappGreeting": "Hello! Welcome to {StoreName}. How can we assist you today?",
  "faq": [
    { "q": "Do you deliver countrywide?", "a": "Yes, we ship across all regions with tracking." },
    { "q": "What payment methods do you accept?", "a": "We accept M-Pesa, Card, and Cash on Delivery." }
  ]
}`;

    const userPrompt = `Generate a complete store blueprint for:
- Business Description: ${validated.businessDescription}
- Store Business Category / Industry: ${selectedIndustry}
${preselectedCategory ? `- Pre-selected Database Product Category: "${preselectedCategory.name}" (ID: ${preselectedCategory.id})` : `- Product Category Hint: ${validated.industry || "Best Match"}`}
- Brand Tone: ${validated.brandTone || "Professional & Modern"}
- Target Audience: ${validated.targetAudience || "General Consumers"}
- Currency: ${validated.currency}

Return ONLY clean valid JSON.`;

    const result = await aiService.generateText(
      {
        prompt: userPrompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 2048,
      },
      {
        companyId: auth.companyId,
        userId: auth.userId,
        feature: "store_setup_ai",
        source: "WEB",
      },
    );

    // Parse JSON safely
    let blueprint: any;
    try {
      const cleanJson = result.text.replace(/```json\n?|\n?```/g, "").trim();
      blueprint = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("[STORE_SETUP_PARSE_ERROR]", result.text);
      throw new AIPlatformError("GENERATION_FAILED", "Failed to parse structured store blueprint", 500);
    }

    // Verify and ensure valid matched category from database
    let resolvedCategory = dbCategories.find(
      (c) => c.id === blueprint.matchedCategory?.id,
    );

    if (!resolvedCategory && preselectedCategory) {
      resolvedCategory = preselectedCategory;
    }

    if (!resolvedCategory && blueprint.matchedCategory?.name) {
      resolvedCategory = dbCategories.find(
        (c) =>
          c.name.toLowerCase().includes(blueprint.matchedCategory.name.toLowerCase()) ||
          blueprint.matchedCategory.name.toLowerCase().includes(c.name.toLowerCase()),
      );
    }

    // Fallback to first available category if none matched
    if (!resolvedCategory && dbCategories.length > 0) {
      resolvedCategory = dbCategories[0];
    }

    if (resolvedCategory) {
      blueprint.matchedCategory = {
        id: resolvedCategory.id,
        name: resolvedCategory.name,
        slug: resolvedCategory.slug,
        matchedExistingSubcategories:
          blueprint.matchedCategory?.matchedExistingSubcategories || [],
        newSubcategories: blueprint.matchedCategory?.newSubcategories || [],
        newBrands: blueprint.matchedCategory?.newBrands || [],
      };

      // Ensure all starter products carry the valid database categoryId and name
      if (Array.isArray(blueprint.starterProducts)) {
        blueprint.starterProducts = blueprint.starterProducts.map((p: any) => ({
          ...p,
          categoryId: resolvedCategory!.id,
          categoryName: resolvedCategory!.name,
        }));
      }
    }

    // Record audit log
    await prisma.aIAuditLog.create({
      data: {
        action: "STORE_SETUP_AI",
        actorId: auth.userId,
        target: auth.companyId,
        details: {
          storeName: blueprint.name,
          businessCategory: selectedIndustry,
          categoryId: blueprint.matchedCategory?.id,
          categoryName: blueprint.matchedCategory?.name,
          newSubcategoriesCount: blueprint.matchedCategory?.newSubcategories?.length || 0,
          newBrandsCount: blueprint.matchedCategory?.newBrands?.length || 0,
          creditsCharged: result.creditsConsumed ?? CREDIT_COST,
          provider: result.provider,
          model: result.model,
        },
      },
    });

    const updatedBalance = await creditLedger.getBalance(auth.companyId);

    return NextResponse.json({
      success: true,
      blueprint,
      creditsCharged: result.creditsConsumed ?? CREDIT_COST,
      remainingBalance: updatedBalance,
    });
  } catch (error: any) {
    console.error("[STORE_SETUP_API_ERROR]", error);
    const status = error instanceof AIPlatformError ? error.statusCode : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
