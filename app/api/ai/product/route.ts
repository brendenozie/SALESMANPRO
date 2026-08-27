/**
 * app/api/ai/product/route.ts
 *
 * POST /api/ai/product
 * Dedicated AI actions for product management:
 * - "DESCRIPTION": Generate compelling description, features, bullet points
 * - "SEO": Generate meta title, meta description, keywords
 * - "ATTRIBUTES": Generate specifications, materials, sizing, warranty
 * - "IMAGE": Generate studio product photo and attach to product
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { productAI } from "@/lib/ai/productAI";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const { action = "DESCRIPTION", ...params } = body;

    const context = {
      companyId: auth.companyId,
      userId: auth.userId,
      source: "WEB" as const,
    };

    let result: any;

    switch (action.toUpperCase()) {
      case "DESCRIPTION":
        result = await productAI.generateDescription(params, context);
        break;

      case "SEO":
        result = await productAI.generateSEO(params, context);
        break;

      case "ATTRIBUTES":
        result = await productAI.generateAttributes(params, context);
        break;

      case "IMAGE":
        if (!params.productId) {
          return NextResponse.json({ success: false, error: "productId is required for image generation" }, { status: 400 });
        }
        result = await productAI.generateAndAttachImage(params, context);
        break;

      default:
        return NextResponse.json({ success: false, error: `Unsupported product AI action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[POST_PRODUCT_AI_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Product AI generation failed",
        code: error.code || "GENERATION_FAILED",
      },
      { status: error.statusCode || 500 },
    );
  }
}
