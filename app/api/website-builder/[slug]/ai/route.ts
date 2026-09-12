import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { creditLedger } from "@/lib/ai/creditLedger";
import {
  CompiledWebsiteConfig,
  CompiledWebsiteConfigSchema,
  SECTION_REGISTRY,
  SectionType,
} from "@/types/website-builder";
import { saveWebsiteDraft, getOrCreateWebsite } from "@/lib/website-builder/website-service";
import { resolveCanonicalTemplate } from "@/lib/website-builder/template-registry";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions());

    if (!session?.user) {
      return formatResponse(false, null, "Authentication required", 401);
    }

    const company = await prisma.company.findUnique({
      where: { slug },
      select: { id: true, name: true, category: true, tagline: true, aiCreditBalance: true },
    });

    if (!company) {
      return formatResponse(false, null, "Store not found", 404);
    }

    const body = await req.json();
    const { prompt, activePageSlug = "home", currentConfig } = body;

    if (!prompt || typeof prompt !== "string") {
      return formatResponse(false, null, "Prompt is required", 400);
    }

    // 1. Credit check & reservation (1 credit per website design request)
    const CREDIT_COST = 1.0;
    const reservation = await creditLedger.reserveCredits({
      companyId: company.id,
      userId: (session.user as any)?.id,
      amount: CREDIT_COST,
      description: "AI Website Assistant Design Mutation",
      metadata: { feature: "website_builder", prompt: prompt.slice(0, 120) },
    });

    // 2. Load current website draft
    let config: CompiledWebsiteConfig;
    if (currentConfig) {
      try {
        config = CompiledWebsiteConfigSchema.parse(currentConfig);
      } catch {
        const res = await getOrCreateWebsite(slug);
        config = res.config;
      }
    } else {
      const res = await getOrCreateWebsite(slug);
      config = res.config;
    }

    // 3. Compact state summary for model context
    const canonicalTemplate = resolveCanonicalTemplate(company.category ?? undefined, undefined, config.templateKey);
    const activePage = config.pages.find((p) => p.slug === activePageSlug) || config.pages[0];
    const contextSummary = {
      storeName: config.storeName,
      templateName: canonicalTemplate.name,
      templateId: canonicalTemplate.id,
      capabilities: canonicalTemplate.capabilities,
      activePageSlug: activePage?.slug || "home",
      themeTokens: config.theme,
      pages: config.pages.map((p) => ({ slug: p.slug, title: p.title })),
      sectionsOnActivePage: (activePage?.sections || []).map((s, idx) => ({
        id: s.id,
        index: idx,
        type: s.type,
        title: s.content?.title || s.content?.headline || s.type,
        subtitle: s.content?.subtitle || "",
      })),
      availableSectionTypes: Object.keys(SECTION_REGISTRY),
    };

    // 4. Model Prompting
    const systemInstruction = `You are the Expert AI Website Designer for SalesmanPro.
Your job is to translate the store owner's design request into STRICT STRUCTURED MUTATION ACTIONS.

Template & Store Context:
- Store Name: "${contextSummary.storeName}"
- Active Template: "${contextSummary.templateName}" (ID: ${contextSummary.templateId})
- Capabilities: ${contextSummary.capabilities.join(", ")}
- Active Page: "${contextSummary.activePageSlug}"
- Current Colors: Primary: ${contextSummary.themeTokens.primaryColor}, Secondary: ${contextSummary.themeTokens.secondaryColor}
- Sections on page: ${JSON.stringify(contextSummary.sectionsOnActivePage)}

CRITICAL PRESERVATION DIRECTIVE:
SalesmanPro templates are intentionally specialized, high-converting designs. 
NEVER flatten or destroy the template's authentic design by replacing it with generic sections.
Instead, modify existing section content, headings, colors, and order to fulfill the merchant's request while maintaining the unique visual identity of the "${contextSummary.templateName}".

You MUST respond with a JSON object in this exact format:
{
  "explanation": "Brief, friendly description of what changes you made",
  "actions": [
    {
      "type": "update_theme_tokens",
      "tokens": { "primaryColor": "#...", "headingFont": "..." }
    },
    {
      "type": "update_section_content",
      "sectionId": "sec-...",
      "content": { "title": "...", "description": "..." }
    },
    {
      "type": "add_section",
      "pageSlug": "home",
      "sectionType": "hero" | "productGrid" | "testimonials" | "featuresBadges" | "ctaBanner" | "faq" | "contact",
      "position": 0,
      "content": { ... }
    },
    {
      "type": "move_section",
      "sectionId": "sec-...",
      "direction": "up" | "down"
    },
    {
      "type": "remove_section",
      "sectionId": "sec-..."
    },
    {
      "type": "create_page",
      "title": "About Us",
      "slug": "about"
    },
    {
      "type": "update_navigation",
      "headerSettings": { "showWhatsAppBtn": true }
    }
  ]
}

SAFETY RULES:
- Never generate raw executable JavaScript or script tags.
- Use established hex colors or standard Google fonts.
- When asked to add a section, use the appropriate sectionType from: [hero, productGrid, productCarousel, categoryGrid, imageWithText, richText, testimonials, featuresBadges, ctaBanner, faq, contact, newsletter].
- Return ONLY valid JSON.`;

    let aiResponseText = "";
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const response = await generateText({
          model: google("gemini-1.5-flash"),
          messages: [
            {
              role: "system",
              content: systemInstruction,
            },
            {
              role: "user",
              content: `User Request: "${prompt}"`,
            },
          ],
          temperature: 0.3,
        });
        aiResponseText = response.text || "{}";
      } catch (geminiError) {
        console.warn("Gemini API call failed, attempting heuristic fallback...", geminiError);
      }
    }

    // Heuristic fallback if AI keys are not configured in dev
    if (!aiResponseText || aiResponseText === "{}") {
      const p = prompt.toLowerCase();
      const actions: any[] = [];
      let explanation = "I've updated your website based on your instructions.";

      if (p.includes("color") || p.includes("modern") || p.includes("emerald") || p.includes("blue") || p.includes("gold")) {
        let newColor = "#059669";
        if (p.includes("blue")) newColor = "#2563EB";
        if (p.includes("gold") || p.includes("yellow")) newColor = "#D97706";
        if (p.includes("purple")) newColor = "#7C3AED";
        actions.push({
          type: "update_theme_tokens",
          tokens: { primaryColor: newColor },
        });
        explanation = `Updated primary color palette to ${newColor} for a fresh, modern storefront feel.`;
      }

      if (p.includes("hero") && (p.includes("headline") || p.includes("title") || p.includes("text") || p.includes("nairobi") || p.includes("collection"))) {
        const heroSection = activePage?.sections?.find((s) => s.type === "hero");
        if (heroSection) {
          actions.push({
            type: "update_section_content",
            sectionId: heroSection.id,
            content: {
              title: p.includes("nairobi")
                ? "Fresh Products Delivered Across Nairobi"
                : "New Season Collection 2026",
              description: "Experience premium craftsmanship, verified quality, and same-day dispatch.",
            },
          });
          explanation += " Updated the hero headline and copy.";
        }
      }

      if (p.includes("move") || p.includes("reorder") || p.includes("above")) {
        const productSec = activePage?.sections?.find((s) => s.type === "productGrid");
        if (productSec) {
          actions.push({
            type: "move_section",
            sectionId: productSec.id,
            direction: "up",
          });
          explanation += " Moved the featured products section higher up.";
        }
      }

      if (p.includes("whatsapp")) {
        actions.push({
          type: "update_navigation",
          headerSettings: { showWhatsAppBtn: true },
        });
        explanation += " Activated the WhatsApp direct contact button in your header.";
      }

      if (p.includes("about") && (p.includes("create") || p.includes("page"))) {
        actions.push({
          type: "create_page",
          title: "About Us",
          slug: "about",
        });
        explanation += " Created an About Us page with story and trust badges.";
      }

      if (actions.length === 0) {
        // General refresh
        actions.push({
          type: "update_theme_tokens",
          tokens: { buttonRadius: "full", cardRadius: "2xl" },
        });
        explanation = "Applied sleek modern rounded borders and visual polish to buttons and cards.";
      }

      aiResponseText = JSON.stringify({ explanation, actions });
    }

    // 5. Parse and apply mutations safely to draft
    let parsedPlan: any = {};
    try {
      parsedPlan = JSON.parse(aiResponseText);
    } catch {
      parsedPlan = { explanation: "Applied requested modifications", actions: [] };
    }

    const appliedSummaries: { action: string; summary: string }[] = [];
    const updatedDraft = JSON.parse(JSON.stringify(config)) as CompiledWebsiteConfig;
    const targetPage = updatedDraft.pages.find((p) => p.slug === activePageSlug) || updatedDraft.pages[0];

    for (const act of parsedPlan.actions || []) {
      if (act.type === "update_theme_tokens" && act.tokens) {
        updatedDraft.theme = { ...updatedDraft.theme, ...act.tokens };
        appliedSummaries.push({ action: "Theme", summary: `Updated theme tokens (${Object.keys(act.tokens).join(", ")})` });
      }

      if (act.type === "update_section_content" && act.sectionId && act.content) {
        const sec = targetPage.sections.find((s) => s.id === act.sectionId);
        if (sec) {
          sec.content = { ...sec.content, ...act.content };
          appliedSummaries.push({ action: "Section", summary: `Updated content for ${sec.type} section` });
        }
      }

      if (act.type === "update_section_style" && act.sectionId && act.styles) {
        const sec = targetPage.sections.find((s) => s.id === act.sectionId);
        if (sec) {
          sec.styles = { ...sec.styles, ...act.styles };
          appliedSummaries.push({ action: "Section", summary: `Updated styles for ${sec.type} section` });
        }
      }

      if (act.type === "add_section" && act.sectionType) {
        const reg = SECTION_REGISTRY[act.sectionType as SectionType];
        if (reg) {
          const newSection = {
            id: `sec-${act.sectionType}-${Date.now()}`,
            type: act.sectionType,
            order: targetPage.sections.length,
            isVisible: true,
            content: act.content || reg.defaultContent,
            styles: act.styles || reg.defaultStyles,
            responsive: reg.defaultResponsive,
            dataSource: reg.defaultDataSource,
          };
          const pos = typeof act.position === "number" ? act.position : targetPage.sections.length;
          targetPage.sections.splice(pos, 0, newSection as any);
          appliedSummaries.push({ action: "Section", summary: `Added new ${reg.title} section` });
        }
      }

      if (act.type === "remove_section" && act.sectionId) {
        const idx = targetPage.sections.findIndex((s) => s.id === act.sectionId);
        if (idx !== -1) {
          const removed = targetPage.sections.splice(idx, 1);
          appliedSummaries.push({ action: "Section", summary: `Removed ${removed[0]?.type || "section"}` });
        }
      }

      if (act.type === "move_section" && act.sectionId) {
        const idx = targetPage.sections.findIndex((s) => s.id === act.sectionId);
        if (idx !== -1) {
          const targetIdx = act.direction === "up" ? Math.max(0, idx - 1) : Math.min(targetPage.sections.length - 1, idx + 1);
          if (targetIdx !== idx) {
            const [item] = targetPage.sections.splice(idx, 1);
            targetPage.sections.splice(targetIdx, 0, item);
            appliedSummaries.push({ action: "Section", summary: `Moved ${item.type} ${act.direction}` });
          }
        }
      }

      if (act.type === "create_page" && act.title && act.slug) {
        const pageExists = updatedDraft.pages.some((p) => p.slug === act.slug);
        if (!pageExists) {
          updatedDraft.pages.push({
            id: `page-${act.slug}-${Date.now()}`,
            title: act.title,
            slug: act.slug,
            isHomepage: false,
            isVisible: true,
            order: updatedDraft.pages.length,
            seo: { metaTitle: act.title, metaDescription: `Learn more at ${act.title}` },
            sections: [
              {
                id: `sec-rich-${Date.now()}`,
                type: "richText",
                order: 0,
                isVisible: true,
                content: {
                  title: act.title,
                  contentHtml: `<p>Welcome to the ${act.title} page. Custom content can be edited anytime.</p>`,
                },
                styles: { paddingTop: "xl", paddingBottom: "xl", textAlign: "left" },
                responsive: { columnsMobile: 1, columnsTablet: 1, columnsDesktop: 1, hideOnMobile: false, hideOnDesktop: false },
              },
            ],
          });
          appliedSummaries.push({ action: "Page", summary: `Created page '${act.title}' (/site/${slug}/${act.slug})` });
        }
      }

      if (act.type === "update_navigation" && act.headerSettings) {
        updatedDraft.navigation.headerSettings = {
          ...updatedDraft.navigation.headerSettings,
          ...act.headerSettings,
        };
        appliedSummaries.push({ action: "Navigation", summary: "Updated header navigation options" });
      }
    }

    // 6. Finalize credit charge
    await creditLedger.finalizeCharge({
      companyId: company.id,
      userId: (session.user as any)?.id,
      reservedAmount: CREDIT_COST,
      actualAmount: CREDIT_COST,
      description: "AI Website Assistant Execution",
      referenceId: reservation.transactionId,
      usageData: {
        capability: "AGENT",
        provider: "GOOGLE",
        model: "gemini-1.5-flash",
        feature: "website_assistant",
      },
    });

    // 7. Save updated draft to MongoDB
    await saveWebsiteDraft(company.id, updatedDraft, (session.user as any)?.id);

    return NextResponse.json({
      success: true,
      data: {
        explanation: parsedPlan.explanation || "Changes successfully applied to draft.",
        appliedActions: appliedSummaries,
        updatedConfig: updatedDraft,
      },
    });
  } catch (error: any) {
    console.error("Error in AI Website Assistant endpoint:", error);
    return formatResponse(false, null, error.message || "Failed to process AI design request", 500);
  }
}
