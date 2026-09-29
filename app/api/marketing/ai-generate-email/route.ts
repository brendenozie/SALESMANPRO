import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import Groq from "groq-sdk";
import { superAdminAIService } from "@/lib/ai/superAdminService";
import { enforceAiStudioAccess } from "@/lib/subscriptions/enforce-limits";

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as {
      user?: { email?: string | null; name?: string | null; id?: string };
    } | null;

    if (!session?.user?.email) {
      return formatResponse(false, null, "Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true, companyId: true },
    });

    if (!user) {
      return formatResponse(false, null, "User account not found", 401);
    }

    const body = await req.json().catch(() => ({}));
    const {
      goal,
      campaignType = "PROMOTIONAL",
      scope = "STORE",
      companyId,
      tone = "Urgent & High-Converting",
      customInstructions = "",
    } = body;

    if (!goal || typeof goal !== "string" || !goal.trim()) {
      return formatResponse(false, null, "Campaign goal or promotion idea is required", 400);
    }

    // Tenant check
    let resolvedBrandName = "SalesmanPro";
    let targetCompanyId = companyId || user.companyId;

    if (targetCompanyId) {
      const aiCheck = await enforceAiStudioAccess(targetCompanyId);
      if (!aiCheck.allowed) {
        return formatResponse(false, { upgradeRequired: aiCheck.upgradeRequired }, aiCheck.message, 403);
      }
    }

    if (scope === "STORE" && targetCompanyId) {
      const company = await prisma.company.findUnique({
        where: { id: targetCompanyId },
        select: { id: true, name: true, slug: true, domain: true },
      });
      if (company) {
        resolvedBrandName = company.name;
      }
    }

    const systemPrompt = `You are an elite, high-converting direct-response email marketing copywriter for the commerce platform ${resolvedBrandName}.
Your job is to generate a compelling, brand-aware email campaign based on the merchant's promotion goal.

CRITICAL INSTRUCTIONS:
1. Personalization: Include the tag '{{name}}' naturally in the greeting and body.
2. Structure: Format paragraphs cleanly with double line breaks for mobile readability.
3. Tone: ${tone}.
4. Output Format: You MUST return ONLY a strict JSON object with NO markdown formatting, NO markdown backticks (\`\`\`json), and NO extraneous commentary.

JSON Schema:
{
  "subject": "Main high-converting subject line",
  "subjectOptions": ["Subject variation 1", "Subject variation 2", "Subject variation 3"],
  "headline": "Compelling main header / announcement title",
  "badgeText": "Short uppercase badge (e.g., '✨ FLASH SALE' or '📢 STORE NOTICE')",
  "highlightBox": "Brief highlight box copy summarizing discount code, perks, or key alert",
  "bodyText": "Multi-paragraph email body with {{name}} tag and clear value proposition",
  "ctaLabel": "Action-oriented button text (e.g. 'Shop Sale Now' or 'View Announcement')",
  "ctaUrl": "https://example.com/shop"
}`;

    const userPrompt = `Campaign Goal: ${goal.trim()}
Campaign Type: ${campaignType}
Brand Name: ${resolvedBrandName}
Additional Notes: ${customInstructions || "None"}`;

    let aiGeneratedJson: any = null;

    // Try AI Generation via Groq / OpenAI / Gemini
    try {
      const dbKey = await superAdminAIService.getDecryptedApiKey("GROQ").catch(() => null);
      const groqKey = dbKey || process.env.GROQ_API_KEY;

      if (groqKey) {
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: "json_object" },
        });

        const rawText = completion.choices[0]?.message?.content || "{}";
        aiGeneratedJson = JSON.parse(rawText);
      }
    } catch (aiErr: any) {
      console.warn("[AIMarketing] Groq generation failed, using intelligent fallback:", aiErr.message);
    }

    // Fallback template if AI call was unavailable or failed
    if (!aiGeneratedJson || !aiGeneratedJson.subject) {
      const isPromo = campaignType === "PROMOTIONAL";
      aiGeneratedJson = {
        subject: isPromo
          ? `Exclusive: Special Offer from ${resolvedBrandName}!`
          : `Important Announcement from ${resolvedBrandName}`,
        subjectOptions: [
          `Special savings inside for you, {{name}}`,
          `Don't miss our latest update at ${resolvedBrandName}`,
          `Hand-picked offers curated just for you`,
        ],
        headline: isPromo
          ? `Discover What's New at ${resolvedBrandName}`
          : `Important Customer Notice`,
        badgeText: isPromo ? "✨ Special Offer" : "📢 Store Notice",
        highlightBox: isPromo
          ? `Limited-time access to exclusive deals and member perks.`
          : `Please review these operational updates to stay informed.`,
        bodyText: `Hello {{name}},\n\nWe wanted to share an exciting update with you regarding our latest selections and special perks at ${resolvedBrandName}.\n\n${goal.trim()}\n\nThank you for choosing ${resolvedBrandName}. We look forward to serving you!`,
        ctaLabel: isPromo ? "Explore Collection" : "Visit Store",
        ctaUrl: `https://salesmanpro.site`,
      };
    }

    return formatResponse(
      true,
      {
        ...aiGeneratedJson,
        brandName: resolvedBrandName,
      },
      "Email campaign copy successfully generated by AI",
      200
    );
  } catch (err: any) {
    console.error("[AIMarketing Generate] POST error:", err);
    return formatResponse(false, null, err.message || "Failed to generate campaign copy", 500);
  }
}
