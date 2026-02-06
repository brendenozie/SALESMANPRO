import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and Validate Input
    const { name, category, section, currentDescription } = await req.json();

    if (!name || !category || !section) {
      return NextResponse.json(
        { error: "Business name, category, and section are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI configuration missing" }, { status: 500 });
    }

    // 3. Sanitize and Construct Prompts
    const sName = name.slice(0, 100).replace(/[<>]/g, "");
    const sCategory = category.slice(0, 100).replace(/[<>]/g, "");

    let prompt = "";
    if (section === "basic") {
      prompt = `Generate a catchy tagline and a compelling 2-3 paragraph business description for a store named "${sName}" in the "${sCategory}" category. Return JSON with "tagline" and "description".`;
    } else if (section === "seo") {
      prompt = `Generate SEO metadata for "${sName}" in "${sCategory}". Context: "${currentDescription || ""}". Return JSON with "title" (max 60 chars), "description" (max 160 chars), and "keywords" (array of 10 strings).`;
    } else if (section === "faqs") {
      prompt = `Generate 5 FAQs for "${sName}" in "${sCategory}". Return JSON with an array "faqs" containing objects with "question" and "answer".`;
    } else if (section === "pricing") {
      prompt = `Generate 3 pricing tiers for "${sName}" in "${sCategory}". Return JSON with "pricingTiers" array containing objects with: name, price (number), description, duration, and features (array of strings).`;
    } else if (section === "marketing") {
      prompt = `Generate 3 hero slides and 2 promotions for "${sName}" in "${sCategory}". Return JSON with "heroSlides" (headline, subline, ctaText, badgeText) and "promotions" (title, description, ctaText, code).`;
    } else {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    // 4. OpenAI Chat Completion
    const textResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional marketing assistant for SALESMANPRO. Always return strictly valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!textResponse.ok) {
      const errorData = await textResponse.json();
      return NextResponse.json({ error: errorData.error?.message || "AI Error" }, { status: textResponse.status });
    }

    const textData = await textResponse.json();
    const content = JSON.parse(textData.choices[0].message.content);

    // 5. Conditional DALL-E Image Generation (Marketing Only)
    if (section === "marketing" && content.heroSlides) {
      const imagePromises = content.heroSlides.slice(0, 2).map(async (slide: any) => {
        try {
          const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: `Minimalist, professional hero banner background for a ${sCategory} store called "${sName}". Style: Modern, clean, high-end. No text in image.`,
              n: 1,
              size: "1024x1024",
            }),
          });
          
          if (!imageRes.ok) return null;
          const imageData = await imageRes.json();
          return imageData.data[0].url;
        } catch (e) {
          return null;
        }
      });

      const imageUrls = await Promise.all(imagePromises);
      content.heroSlides = content.heroSlides.map((slide: any, i: number) => ({
        ...slide,
        imageUrl: imageUrls[i] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8", // Fallback image
      }));
    }

    return NextResponse.json(content);

  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}